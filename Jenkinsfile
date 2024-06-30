pipeline {
    agent any

    environment {
        // Define environment variables if needed
        NODE_VERSION = '14' // Adjust based on your Node.js version
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the repository
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install Node.js dependencies
                sh 'npm install'
                // Or if using Yarn:
                // sh 'yarn install'
            }
        }

        stage('Build') {
            steps {
                // Build the Next.js application
                sh 'npm run build'
                // Or if using Yarn:
                // sh 'yarn build'
            }
        }

        stage('Run Tests') {
            steps {
                // Run tests (if applicable)
                sh 'npm run test'
                // Or if using Yarn:
                // sh 'yarn test'
            }
        }

        stage('Deploy') {
            steps {
                // Example: Deploy to a staging environment
                // Replace with your deployment commands (e.g., Docker, FTP, etc.)
            }
        }
    }

    post {
        success {
            // Archive artifacts (e.g., build output, test reports)
            archiveArtifacts artifacts: '**/.next/**', allowEmptyArchive: true
            junit '**/coverage/lcov-report/*.xml' // Example for test coverage reports
        }

        failure {
            // Actions to take if the pipeline fails
            echo 'The pipeline has failed!'
        }

        always {
            // Clean up or post-processing steps
            deleteDir() // Clean up workspace
        }
    }
}
