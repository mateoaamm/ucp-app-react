pipeline {
    agent any

    tools {
        nodejs 'Node_24'                      // Manage Jenkins > Tools > NodeJS
    }

    environment {
        SCANNER_HOME = tool 'SonarScanner'    // Manage Jenkins > Tools > SonarQube Scanner
    }

    options {
        timeout(time: 20, unit: 'MINUTES')    // ningún build queda colgado
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/mateoaamm/ucp-app-react.git'
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'                   // instala exactamente lo de package-lock.json
            }
        }

        stage('Pruebas Unitarias + Cobertura') {
            steps {
                // Una sola corrida: genera junit.xml (Jenkins) y coverage/lcov.info (SonarQube)
                sh 'npm test -- --watchAll=false --ci --coverage --reporters=default --reporters=jest-junit'
            }

            post {
                always {
                    junit 'junit.xml'
                    archiveArtifacts artifacts: 'junit.xml',
                                     allowEmptyArchive: true
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {   // System > SonarQube servers > Name
                    sh '"$SCANNER_HOME/bin/sonar-scanner" -Dsonar.nodejs.executable="$(command -v node)"'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
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
                    Calidad (SonarQube): http://localhost:9000/dashboard?id=ucp-app-react
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

Build, pruebas y analisis SonarQube OK.
Quality Gate: aprobado.

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

El pipeline ha fallado (pruebas, build o Quality Gate).
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
