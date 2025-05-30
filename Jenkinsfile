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
            steps {
                echo "Checking out code...."
                checkout scm
            }
        }

        stage ('Install Dependencies') {
            steps{
                echo "Installing Dependencies..."
                sh 'npm install'
            }
        }

        // development branch
        stage ('Built In Development') {
            steps {
                echo "Building in Development"
                // sh 'npm run dev'
                sh 'docker-compose up --build -d'
            }
        }

// Production and deployment will be configured lator
        stage ('Build in Production') {
            when {
                branch 'main'
            }
            steps {
                echo "Building in Production"
                sh 'npm start'
            }
        }

        stage ('Deploy Application') {
            when {
                branch 'main'
            }
            steps {
                echo "Deploying the appplication"
                // Deployment logic will be configured lator  
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
