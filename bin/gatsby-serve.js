#!/usr/bin/env node
require("babel/register")({
	stage: 0
});

require('coffee-script/register');
require('./serve');
