1. Launch AWS Instance -- Linux based
	public DNS: ec2-13-233-120-160.ap-south-1.compute.amazonaws.com
	public ipv4 : 13.233.120.160
2. update all packages -- sudo yum install command
3. install nvm
 	-- curl -o- [https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh](https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh) | bash
4. install node 
5. install git on local machine and upload project on git repository
6. mongodb installation on aws ec2'
	move to folder etc/yum.repos.d
		cd ..
		cd ..
		cd ect//yum.repos.d
	create a file mongodb-org.4.0.repo
	save the following text in file
		**[mongodb-org-3.6]**  
	name=MongoDB Repository  
	baseurl=https://repo.mongodb.org/yum/amazon/2013.03/mongodb-org/3.6/x86_64/  
	gpgcheck=1  
	enabled=1  
	gpgkey=https://www.mongodb.org/static/pgp/server-3.6.asc

	1. install mongodb package
		sudo yum install -y mongodb-org
	2. start mongod instance
		sudo service mongod start
7. start node js server on ec2-instance
8. Keep the app running all the time
	install pm2 // process manager for node
	move to cloned folder and then run the following command
		pm2 start server.js

		pm2 startup // to start the app on startup

		it generates a script.. copy the script and run in terminal

		then
		pm2 save
		
		pm2 list // list currently active process
		pm2 monit // monitor currently active process
