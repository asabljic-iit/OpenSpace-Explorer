From https://docs.google.com/document/d/1kT4fvXO5Jch16ugl7BfeB7PlupowD8h1dOeX2SaydzQ/edit?tab=t.0#heading=h.bwbcx8owgtcf

# How to Set Up OpenSpace and Web Server
Amir Sabljic

Hello! Welcome to this guide on how to set up the OpenSpace WWT replacement.

## Running OpenSpace and the Tablet Interface

### 1 Download Node.js

Once you’ve downloaded and placed the files in the correct directories, head to 
the \user\data\assets\WWT\ web folder.

If you want to set up the web server to enable the tablet interface functionality, 
follow the following steps. Otherwise, you can just run start-all.bat and close 
the web server terminal. To install the web server, you must install Node.js. An 
executable MSI installer is provided to you in the \web folder. You will need to 
have administrative privileges when installing. Click on node-v26.5.0-x64.msi and 
follow the steps shown on your screen. You may skip installing additional tools. 

### 2 Running the Web Server

After you’ve finished installing, run start-web-server.bat to test if the web 
server works. It will install some libraries on the first run. You may get an 
administrator prompt. Click Allow, then restart your computer and run 
start-web-server.bat once again.

Once the libraries are installed, connect your web browser by going to the IP 
address shown in the terminal.

If you are able to access the website, great! You can now also access the 
interface on a tablet by going to the IP address on a browser. Ensure that the 
tablet and the computer running the web server are connected to the same WiFi 
network. To then add the interface as a web app on an iOS tablet in Safari, go 
to the Share button in the top left corner. Click on “View More”, then click on 
“Add to Home Screen.”

### 3 Running OpenSpace

Once you’ve set up the web server and verified it working, you may now run 
OpenSpace. In the \web folder, run start-all.bat which will run OpenSpace and the 
web server. Connect your tablet’s web browser to the web server. The website will 
occasionally reload until OpenSpace has finished initialization. Once OpenSpace 
has finished loading, you should be able to see the full interface on your tablet.

