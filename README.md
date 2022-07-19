# ARSENAL

## Overview

The Arsenal tool was developed for JNWC by ICR, Inc. This web application is a port from an Excel file originally
created by Siggy at JNWC.

### Arsenal App

This is the web application portion of the Arsenal tool. It is written in ReactJS and was based off of the
create-react-app framework created by Facebook. It can be developed in a standalone mode if desired.

### Arsenal Services

The web services of the tool are written using NodeJS/Express to increase speed and decrease development timelines. The
API can be accessed by going to http://localhost:8000/

### Arsenal Admin

This is a web-based tool to interact with the SQLite database. It mounts the database at runtime and can work in
parallel with the Arsenal Services. When developing locally, it can be accessed by going
to http://localhost:2015

The container is the official CloudBeaver image with the /db directory mounted to its /var/cloudbeaver/server path. The 
configurations are stored in the /db directory as well. Because it is so lightweight, it is not a big deal if the configurations
are deleted or moved with the project. Here are the steps to set the configurations that the Arsenal DB admin tool needs:   

- Click "Next to setup the DB server"  
Server Name: <code> Arsenal DB Server </code>  
Server URL: <code> http://localhost:2015 </code>  
Login: <code> arsenal_admin </code>  
Password: <code> Admin </code>    
  
- In the Connection Management tab, add a new SQLite database connection:   
Driver: <code> SQLite </code>  
Connection Name: <code> Arsenal DB </code>  
Database: <code> ${application.path}/../workspace/db.sqlite </code>  
Test the connection and make sure you get "Connection is established"

- Click on the "Cloud Beaver" icon in the top-left of the page to go to the DB
- Double-click on the "Arsenal DB" tab on the left

## Development

NOTE: Run all commands below from root <code>arsenal/</code> directory.

### To start the entire platform

<code>docker-compose up -d</code>

This starts the services, the web application, and the PHP Lite Admin page at the same time

### To start Arsenal App

<code>cd arsenal-app</code>  
<code>npm install</code> *If needed  
<code>npm start</code>

**This will only start the web application and will not leverage any of the services.  
There will be no data available in the app if started this way.

### To start Arsenal services

From the root Arsenal directory:  
<code>docker-compose up arsenal-services</code>

After changes, the services can be rebuilt using:  
<code>docker-compose up --no-deps --build arsenal-services </code>

### To start PHP Lite Admin

From the root Arsenal directory:  
<code>docker-compose up php-lite-admin</code> 

## Deployment

**Create the docker images**  
<code>docker build -f Dockerfile-prod --no-cache -t arsenal-app .</code>  
<code>docker build -f Dockerfile-prod --no-cache -t arsenal-services .</code>  

OR

<code>docker-compose -f docker-compose-prod.yml build</code>

**Save the images**  
<code>docker save arsenal-app:latest | gzip > arsenal-app-< buildDate >.tar.gz</code>  
<code>docker save arsenal-services:latest | gzip > arsenal-services-< buildDate >.tar.gz</code>  
<code> docker save dbeaver/cloudbeaver:latest | gzip > arsenal-admin-< buildDate >.tar.gz </code>

**Load the docker image:**  
<code>docker load -i arsenal-app.tar.gz</code>  
<code>docker load -i arsenal-services.tar.gz</code>  
<code>docker load -i arsenal-admin.tar.gz</code>  

**Run the image:**  
<code> docker-compose -f docker-compose-prod.yml up -d </code>   

** Note **  You may need to run a <code>docker container prune</code> if it gives you an error about finding images

OR

<code> docker run -p 3001:80 arsenal-app:latest </code>   

To run PHP-Lite-Admin  
<code>docker run -it --rm -v /mnt/c/Users/bslaughter.CORP/workspace/arsenal/db:/db -p 2015:2015 acttaiwan/phpliteadmin</code>

<code>--restart unless-stopped</code>

TAR up the main project code:  
<code> tar zcvf arsenal.tar.gz --exclude "arsenal/arsenal-app/node_modules" --exclude "arsenal/arsenal-services/node_modules" --exclude "arsenal/.idea" --exclude "arsenal/.git" --exclude "arsenal/node_modules" --exclude "arsenal/*.gz" --exclude "arsenal/*.xlsm" arsenal</code>

For Arsenal Serivces, make sure to change the RECEIVER_CALCULATED_LOSS environment variable to the correct value in production.   
Docker-compose Entry:     
```
environment:
- RECEIVER_CALCULATED_LOSS=0
```