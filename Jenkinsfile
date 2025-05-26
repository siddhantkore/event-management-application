pipeline {
    agent any

    environment {
        NODE_ENV='development'
    }

    tools {
        nodejs 'NodeJs 20.19.2'
    }

    stages {

        stage ('Checkout Code') {
            echo "Checking out code...."
            checkout scm
            // Check this again
            // trigger
        }

        stage ('Install Dependencies') {
            echo "Installing Dependencies..."
            sh 'npm install'
        }

        stage ('Built In Development') {
            echo "Building in Development"
            sh 'npm run dev'
        }

        stage ('Build in Production') {
            echo "Building in Production"
            sh 'npm start'
        }

        stage ('Deploy Application') {
            when {
                branch 'main'
            }
            steps {
                echo "Deploying the appplication"
                // Deployment logic will be configut=red lator  
            }
        }

    }
    post {
        success {
            echo "Build COMPLETED Successfully !!!!"
        }
        failure {
            echo "Build FAILED :("
        }
    }

}