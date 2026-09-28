pipeline {
    agent any

    tools {
        nodejs 'Node_24'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/mateoaamm/ucp-app-react.git'
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Pruebas Unitarias') {
            steps {
                sh 'npm test -- --watchAll=false --ci --reporters=default --reporters=jest-junit'
            }

            post {
                always {
                    junit 'junit.xml'
                    archiveArtifacts artifacts: 'junit.xml',
                                     allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            emailext(
                subject: "Pipeline ${currentBuild.currentResult}: ucp-app-react #${env.BUILD_NUMBER}",
                body: """
                    Estado: ${currentBuild.currentResult}
                    URL Build: ${env.BUILD_URL}
                    Detalles de Pruebas: ${env.BUILD_URL}testReport/
                """,
                to: 'mateoarroyave26@gmail.com'
            )
        }

        success {
            script {
                withCredentials([
                    string(credentialsId: 'telegram-bot-token', variable: 'TELEGRAM_BOT_TOKEN'),
                    string(credentialsId: 'telegram-chat-id', variable: 'TELEGRAM_CHAT_ID')
                ]) {
                    sh '''
MESSAGE="JENKINS CI - actividad4telegram

Proyecto: ucp-app-react
Build: #${BUILD_NUMBER}
Rama: main
Estado: SUCCESS

Build y pruebas ejecutados correctamente.

URL Jenkins:
${BUILD_URL}"

curl --silent --show-error --fail \
  -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "text=${MESSAGE}"
                    '''
                }
            }
        }

        failure {
            script {
                withCredentials([
                    string(credentialsId: 'telegram-bot-token', variable: 'TELEGRAM_BOT_TOKEN'),
                    string(credentialsId: 'telegram-chat-id', variable: 'TELEGRAM_CHAT_ID')
                ]) {
                    sh '''
MESSAGE="ALERTA JENKINS CI - actividad4telegram

Proyecto: ucp-app-react
Build: #${BUILD_NUMBER}
Rama: main
Estado: FAILURE

El pipeline ha fallado.
Revisar Console Output en Jenkins.

URL Jenkins:
${BUILD_URL}"

curl --silent --show-error --fail \
  -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "text=${MESSAGE}"
                    '''
                }
            }
        }
    }
}