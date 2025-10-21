*** Deployment of artifact from s3 to ec2 using codeDeploy service ***

ChatGPT said:

Perfect! Since you already have your artifact in S3, we can deploy it to your EC2 instance using AWS CodeDeploy directly. I’ll give you a step-by-step procedure.

Step 0: Prerequisites

EC2 instance

Running Amazon Linux 2

CodeDeploy agent installed and running:

sudo yum update -y
sudo yum install ruby wget -y
cd /home/ec2-user
wget https://aws-codedeploy-<region>.s3.<region>.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
sudo service codedeploy-agent start
sudo service codedeploy-agent status


Replace <region> with your AWS region.

EC2 instance IAM role

Must have AmazonEC2RoleforAWSCodeDeploy attached.

Example policy allows CodeDeploy agent to access S3 and CloudWatch.

S3 bucket

Contains your build artifact (my-node-app.zip).

Local directory structure in your repo (nodeJsApp/) should include:

nodeJsApp/
├── appspec.yml
├── scripts/
│   ├── install_dependencies.sh
│   └── start_server.sh
├── app.js
├── package.json
└── node_modules/

Step 1: Create appspec.yml for CodeDeploy

Inside nodeJsApp/:

version: 0.0
os: linux
files:
  - source: /
    destination: /home/ec2-user/nodeJsApp

hooks:
  AfterInstall:
    - location: scripts/install_dependencies.sh
      timeout: 300
      runas: ec2-user
  ApplicationStart:
    - location: scripts/start_server.sh
      timeout: 300
      runas: ec2-user


Explanation:

source: / → all files from the artifact

destination → folder on EC2

Hooks run after files are copied.

Step 2: Create Deployment Scripts
scripts/install_dependencies.sh
#!/bin/bash
cd /home/ec2-user/nodeJsApp
npm install

scripts/start_server.sh
#!/bin/bash
cd /home/ec2-user/nodeJsApp
pm2 stop all || true   # Stop previous runs
pm2 start app.js


Make scripts executable:

chmod +x scripts/*.sh

Step 3: Create CodeDeploy Application

Open AWS CodeDeploy console → Applications → Create application

Application name: NodeJsApp

Compute platform: EC2/On-premises

Click Create deployment group

Deployment group name: NodeJsApp-DeploymentGroup

Service role: Attach a CodeDeploy service role

Environment configuration: Choose EC2 instances by tag (e.g., Name=MyNodeServer)

Deployment type: In-place

Leave Load Balancer empty if not using

Step 4: Start Deployment

Go to your CodeDeploy application → Deployments → Create deployment

Deployment type: In-place

Revision type: My application is stored in S3

S3 bucket name: <your-artifact-bucket>

S3 object key: my-node-app.zip

Deployment group: NodeJsApp-DeploymentGroup

Click Deploy

CodeDeploy will now:

Copy my-node-app.zip to /home/ec2-user/nodeJsApp on your EC2

Run AfterInstall → installs npm dependencies

Run ApplicationStart → starts the Node.js app

Step 5: Verify Deployment

Check CodeDeploy logs on EC2:

sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log


Check if app is running:

pm2 list


Open in browser:

http://<EC2-Public-IP>:3000


You should see your Node.js app running.

✅ Done! Your artifact is deployed successfully to EC2 using CodeDeploy.