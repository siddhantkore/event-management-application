pipeline {
    agent any

    environment {
        NODE_ENV='development'
    }

    tools {
        nodejs 'NodeJs 18'
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
            script {
                emailext (
                    to: 'megastorage2112@gmail.com, kore7447@gmail.com',
                    subject: "Jenkins Build Success: ${env.JOB_NAME} - #${env.BUILD_NUMBER}",
                    body: """
                        <p>Build ${env.JOB_NAME} - #${env.BUILD_NUMBER} is SUCCESSFUL!</p>
                        <p>Branch: ${env.BRANCH_NAME}</p>
                        <p>Console Output: <a href="${env.BUILD_URL}console">${env.BUILD_URL}console</a></p>
                        <p>Changes:</p>
                        ${TOKEN_MACRO_CHANGES_SINCE_LAST_SUCCESS}
>>>>>>>>> Temporary merge branch 2
                    """,
                    mimeType: 'text/html'
                )
            }
        }
        failure {
            echo "Build FAILED :("
            script {
                emailext (
                    to: 'megastorage2112@gmail.com, kore7447@gmail.com',
                    subject: "Jenkins Build FAILURE: ${env.JOB_NAME} - #${env.BUILD_NUMBER}",
                    body: """
                        <p style="color:red">Build ${env.JOB_NAME} - #${env.BUILD_NUMBER} has FAILED!</p>
                        <p>Branch: ${env.BRANCH_NAME}</p>
                        <p>Console Output: <a href="${env.BUILD_URL}console">${env.BUILD_URL}console</a></p>
                        <p>Check the build logs for details.</p>
                        <p>Changes:</p>
<<<<<<<<< Temporary merge branch 1
                        ${CHANGES_SINCE_LAST_FAILURE}
=========
                        ${TOKEN_MACRO_CHANGES_SINCE_LAST_FAILURE}
>>>>>>>>> Temporary merge branch 2
                    """,
                    mimeType: 'text/html'
                )
            }
        }
    }

}
