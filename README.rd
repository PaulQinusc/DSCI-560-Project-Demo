Steps to correctly use the demo:
1.Download the files in one folder 
2.Setup the mysql Database and change the username and password in the server.js
  2.1 Open the DatabaseCreation.sql file and run it to create needed database and tables
3.Change the Google map distance maxtrix API key in final_model.py file at line 11 so that you can call the API correctly; 
Also, in the ir.py file, at line 33 you need to get a api token from platerecognizer.com to successfully call the api.
4.Run node server.js in command line to connect to the local host at port 3000.
5.go the localhost:3000 to see the main pages and demostration.
