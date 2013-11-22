Description
===========

Crossmon services contains of two services. crossmon-server 
acts as http and storage server for the collected 
datas. The http server presents all the collected data in graphs trough 
the website. The 
second service [crossmon-collect](https://npmjs.org/package/crossmon-collect) 
run on every machine you want to observe. This service starts 
periodically the collecting modules and send the collected 
datas to the crossmon-server.



A sample configuration file can be found in the module directory. 
At the startup crossmon-server searches for a configuration file. 

This is the search order:

* /etc/crossmon/config.json
* [module-home-directory]/config.json
* [module-home-directory]/config.sample.json

Depending on your configuration you need to install a database module:

* npm install sqlite3 for storing the data in a sqlite-database
* npm install mysql for storing the data in a mysql-database
* other databases comming soon ...

Requirements
============

* [node.js](http://nodejs.org/) -- v0.8.0 or newer

Installation
============

    npm install crossmon-server -g

To start with a sample configuration gattering the cpu usage of the current machine you can use the simple setup script:

    crossmon-server simplesetup

To configure the hole service including the allowed collecting machines (clients), you can run:

    crossmon-server setup

Running
=======

You can start the service with

    crossmon-server start

Stop the service with

    crossmon-server stop

Restarting the service with

    crossmon-server restart

Getting information of the current configuration

    crossmon-server info

