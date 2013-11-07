Description
===========

Crossmon-server is a monitoring server for linux and osx. 
Crossmon-server can handle multiple servers in a network. 
Results can be displayed in a html5 compatible browser.

Requirements
============

* [node.js](http://nodejs.org/) -- v0.8.0 or newer

Installation
============

    npm install crossmon-server

A sample configuration file can be found in the module directory. 
At the startup crossmon-server searches for a configuration file. This is the search order:

* /etc/crossmon/config.json
* [module-home-directory]/config.json
* [module-home-directory]/config.sample.json

Depending on your configuration you need to install a database module:

* npm install sqlite3 for storing the data in a sqlite-database
* npm install mysql for storing the data in a mysql-database
* other databases comming soon ...

Running
=======

    node server.js
or

    foerver start server.js

