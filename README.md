# Sapporo
<img src="https://travis-ci.org/catsass19/Sapporo.svg?branch=master"/>
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b7b87100ff544c75a9b95cdda192d089)](https://www.codacy.com/app/catsass19/Sapporo?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=catsass19/Sapporo&amp;utm_campaign=Badge_Grade)

Sapporo is a web app for hosting online coding competition

##### How to run
It's based on Meteor.js. So just run it like other Meteor projects
```
meteor npm install
meteor
```

# Features
- Dashboard: Overview over current competition status for students
- Inbox
  - View messages from admin
- Survey
  * After competition is over, teams can submit a survey response
  * Admin can search individual teams and see their answers
  * TODO: How to aggregate the results?
  * TODO: Maybe move to some 3rd party survey system (says Tony)
- About page
  * Info page showing which technologies CodeWars 2.0 is built with
- Login/Logout
- Admin
  - System Settings
    * Set project name
    * Set start and end time of the competition
    * Probably broken SSO login via Facebook and HPE Passport
    * Allow accout creation. Only useful for in-person competition
    * Set maximum number of parallel executions
    * TODO: What is submission interval?
    * TODO: What is timeout?
  - Problem Configuration
    * Configure problem languages
    * Configure problems
  - Docker Settings
    * Configure docker daemons
    * Configure how languages are compiled with containers
  - Data Statistics
    * Which problems solved how often
    * Ranking of students
  - Server Monitor
    * TODO: What does it show?
  - Send Mail
    * Send a message to every student
  - Manage Users
    * Allows to batch create users
    * TODO: Implement import from registration
  - Performance Test
    * Sends compilations to daemon and measures time
- Problems (has score)
  * See problems with description
  * See pictures
  * See Example stdin and stdout
  * Enter code
  * Test with test input
  * Submit code: (First test and submit when successful)

# Set up
1. Start mongo and sapporo container with `docker-compose up`
3. Open webpage and create admin account with `admin:awesomecodewar`
4. Set up docker connection and languages
  1. If your docker daemon only listens on a unix socket, socat it:
     - `socat TCP-LISTEN:2376,reuseaddr,fork UNIX-CONNECT:/var/run/docker.sock`
  2. Enter `172.17.0.1:2376` as docker connection
  3. Click on the configuration to validate that we can connect to the daemon
  4. Add languages (see below for configuration)
  5. Run `docker pull python:3` for each container (replace container name)
  6. Test language support
5. Add other hosts
  1. Run socat
  2. Allow inbound traffic on port 2376 for security group of docker host by security group of sapporo host
  3. Pull docker images for all languages
  4. Configure IP and port of docker host

## How to install docker and docker-compose on AWS Linux

```
sudo yum install -y docker
sudo service docker start
# Add yourself to docker group, so sudo is not required
sudo usermod -a -G docker ec2-user
# Make it autostart
sudo chkconfig docker on

# Useful  tools
sudo yum install -y git tmux

# Download docker-compose
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Then log out and in again
```

# Language configuration
- Python 2
  - docker image: `python:2`
  - Executable: `timeout 10 python2`
  - File Name: `test.py`
  - Args2: `<`
  - Test Input File: `input`
  - STD input for test: `sss`
  - Testing script: `print("This is Python2")`
- Python 3
  - docker image: `python:3`
  - Executable: `timeout 10 python3`
  - File Name: `test.py`
  - Args2: `<`
  - Test Input File: `input`
  - STD input for test: `sss`
  - Testing script: `print("This is Python3")`
- Java
  - docker image: `azul/zulu-openjdk:8`
  - Executable: `javac`
  - File Name: `codewars.java`
  - Args2: `> /dev/null 2>&1 && cd /; timeout 10 java codewars <`
  - Test Input File: `input`
  - STD input for test: `sss`
  - Testing script: `class codewars { public static void main(String[] args) { System.out.println("This is Java"); } }`
- C++
  - docker image: `gcc:10.2.0`
  - Executable: `javac`
  - File Name: `codewars.java`
  - Args2: `> /dev/null 2>&1 && cd /; timeout 10 java codewars <`
  - Test Input File: `input`
  - STD input for test: `sss`
  - Testing script: `#include<stdio.h> int main() { printf("This is C++\n"); return 0; }`
- C
  - docker image: `gcc:10.2.0`
  - Executable: `g++`
  - Args1: `-o output -std=c++11 -O2`
  - File Name: `test.c`
  - Args2: `&& timeout 10 ./output <`
  - Test Input File: `input`
  - STD input for test: `sss`
  - Testing script: `#include<stdio.h> int main() { printf("This is C\n"); return 0; }`
