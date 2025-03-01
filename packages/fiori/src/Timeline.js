import UI5Element from "@ui5/webcomponents-base/dist/UI5Element.js";
import { getI18nBundle } from "@ui5/webcomponents-base/dist/i18nBundle.js";
import litRender from "@ui5/webcomponents-base/dist/renderer/LitRenderer.js";
import { isTabNext, isTabPrevious } from "@ui5/webcomponents-base/dist/Keys.js";
import ItemNavigation from "@ui5/webcomponents-base/dist/delegate/ItemNavigation.js";
import NavigationMode from "@ui5/webcomponents-base/dist/types/NavigationMode.js";
import { TIMELINE_ARIA_LABEL } from "./generated/i18n/i18n-defaults.js";
import TimelineTemplate from "./generated/templates/TimelineTemplate.lit.js";
import TimelineItem from "./TimelineItem.js";

// Styles
import styles from "./generated/themes/Timeline.css.js";
import TimelineLayout from "./types/TimelineLayout.js";

const SHORT_LINE_WIDTH = "ShortLineWidth";
const LARGE_LINE_WIDTH = "LargeLineWidth";

/**
 * @public
 */
const metadata = {
	tag: "ui5-timeline",
	languageAware: true,
	managedSlots: true,
	properties: /** @lends sap.ui.webcomponents.fiori.Timeline.prototype */ {
		/**
		 * Defines the items orientation.
		 *
		 * <br><br>
		 * <b>Note:</b>
		 * Available options are:
		 * <ul>
	 	* <li><code>Vertical</code></li>
	 	* <li><code>Horizontal</code></li>
		 * </ul>
		 *
		 * @type {TimelineLayout}
		 * @defaultvalue "Vertical"
		 * @since 1.0.0-rc.15
		 * @public
		 */
		layout: {
			type: TimelineLayout,
			defaultValue: TimelineLayout.Vertical,
		},

		/**
		 * Defines the accessible ARIA name of the component.
		 *
		 * @type {string}
		 * @defaultvalue: ""
		 * @public
		 * @since 1.2.0
		 */
		accessibleName: {
			type: String,
		},
	},
	slots: /** @lends sap.ui.webcomponents.fiori.Timeline.prototype */ {
		/**
		 * Determines the content of the <code>ui5-timeline</code>.
		 *
		 * @type {sap.ui.webcomponents.fiori.ITimelineItem[]}
		 * @slot items
		 * @public
		 */
		"default": {
			propertyName: "items",
			type: HTMLElement,
			individualSlots: true,
		},
	},

};

/**
 * @class
 *
 * <h3 class="comment-api-title">Overview</h3>
 *
 * The <code>ui5-timeline</code> component shows entries (such as objects, events, or posts) in chronological order.
 * A common use case is to provide information about changes to an object, or events related to an object.
 * These entries can be generated by the system (for example, value XY changed from A to B), or added manually.
 * There are two distinct variants of the timeline: basic and social. The basic timeline is read-only,
 * while the social timeline offers a high level of interaction and collaboration, and is integrated within SAP Jam.
 *
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webcomponents.fiori.Timeline
 * @extends UI5Element
 * @tagname ui5-timeline
 * @appenddocs TimelineItem
 * @public
 * @since 0.8.0
 */
class Timeline extends UI5Element {
	static get metadata() {
		return metadata;
	}

	static get styles() {
		return styles;
	}

	static get render() {
		return litRender;
	}

	static get template() {
		return TimelineTemplate;
	}

	constructor() {
		super();

		this._itemNavigation = new ItemNavigation(this, {
			getItemsCallback: () => this.items,
		});
	}

	static get dependencies() {
		return [TimelineItem];
	}

	static async onDefine() {
		Timeline.i18nBundle = await getI18nBundle("@ui5/webcomponents-fiori");
	}

	get ariaLabel() {
		return this.accessibleName
			? `${Timeline.i18nBundle.getText(TIMELINE_ARIA_LABEL)} ${this.accessibleName}`
			: Timeline.i18nBundle.getText(TIMELINE_ARIA_LABEL);
	}

	_onfocusin(event) {
		const target = event.target;

		this._itemNavigation.setCurrentItem(target);
	}

	onBeforeRendering() {
		this._itemNavigation.navigationMode = this.layout === TimelineLayout.Horizontal ? NavigationMode.Horizontal : NavigationMode.Vertical;

		for (let i = 0; i < this.items.length; i++) {
			this.items[i].layout = this.layout;
			if (this.items[i + 1] && !!this.items[i + 1].icon) {
				this.items[i]._lineWidth = SHORT_LINE_WIDTH;
			} else if (this.items[i].icon && this.items[i + 1] && !this.items[i + 1].icon) {
				this.items[i]._lineWidth = LARGE_LINE_WIDTH;
			}
		}
	}

	_onkeydown(event) {
		if (isTabNext(event)) {
			if (!event.target.nameClickable || event.isMarked === "link") {
				this._handleTabNextOrPrevious(event, isTabNext(event));
			}
		} else if (isTabPrevious(event)) {
			this._handleTabNextOrPrevious(event);
		}
	}

	_handleTabNextOrPrevious(event, isNext) {
		const nextTargetIndex = isNext ? this.items.indexOf(event.target) + 1 : this.items.indexOf(event.target) - 1;
		const nextTarget = this.items[nextTargetIndex];
		if (!nextTarget) {
			return;
		}
		if (nextTarget.nameClickable && !isNext) {
			event.preventDefault();
			nextTarget.shadowRoot.querySelector("[ui5-link]").focus();
			return;
		}
		event.preventDefault();
		nextTarget.focus();
		this._itemNavigation.setCurrentItem(nextTarget);
	}
}

Timeline.define();

export default Timeline;
