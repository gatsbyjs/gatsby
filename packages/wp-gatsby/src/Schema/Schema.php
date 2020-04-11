<?php

namespace WPGatsby\Schema;

/**
 * Modifies the schema
 */
class Schema {
	/**
	 *
	 */
	function __construct() {
		new PostTypes();
		new SiteMeta();
	}
}
