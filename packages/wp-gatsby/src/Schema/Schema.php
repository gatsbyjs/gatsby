<?php 

namespace WP_Gatsby\Schema;

/**
 * Modifies the schema
 */
class Schema
{
    /**
     * 
     */
    function __construct()
    {
        new PostTypes();
        new SiteMeta();
    }
}
?>