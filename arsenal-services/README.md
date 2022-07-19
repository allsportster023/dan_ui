# Getting Started with Arsenal Web Services

##First Time Development
This services uses better-sqlite3, which required npm-gyp.
Because of that, there are a few requirements that add significantly to the image build time.
To get around this, I created a base image with the following command from the arsenal-services dir:  
<code>docker build -f Dockerfile_baseimage --no-cache -t arsenal-services-base-image .</code>

Here is the original Dockerfile to create the base image:  

```
FROM node:16-alpine as dependencies
RUN apk add g++ make python2
```

##Running development
###To run just the services:
Run this from the root arsenal/ directory:  
<code>docker-compose up arsenal-services</code>

###To rebuild after making changes:
Run this from the root arsenal/ directory:  
<code>docker-compose up --no-deps --build arsenal-services </code>

###Do not bother with this:
OR from the arsenal-services/ directory  
<code>docker-compose build </code>  
<code>docker-compose up</code>

# Deployment Notes

### Build the image for deployment   
```docker-compose build arsenal-services```

### Package the image for transfer:  
```docker save arsenal_arsenal-services:latest | gzip > arsenal_arsenal-services.tar.gz```

### Load the image on SIPR:
```docker load -i arsenal_arsenal-services.tar.gz```

### Start the image  
```docker-commpose up arsenal-services```

### Modify files for Ops (Temporary)
Add ```baseUrl: "/arsApi"```  to swagger.json   
Change schemes from `http`  to `https`  swagger.json