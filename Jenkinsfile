pipeline {
    agent any

    tools {
        nodejs 'Node_24'
    }

    environment {
        SCANNER_HOME = tool 'SonarScanner'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
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
                sh 'npm ci'
            }
        }

        stage('Pruebas Unitarias + Cobertura') {
            steps {
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

        stage('Security Scan with Snyk') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'SNYK_API_TOKEN',
                        variable: 'SNYK_TOKEN'
                    )
                ]) {
                    sh 'npm install -g snyk'

                    script {
                        def snykStatus = sh(
                            script: 'snyk test --severity-threshold=high',
                            returnStatus: true
                        )

                        if (snykStatus == 1) {
                            unstable('Snyk detecto vulnerabilidades HIGH o CRITICAL')
                        } else if (snykStatus != 0) {
                            error("Snyk no pudo completar el analisis. Exit code: ${snykStatus}")
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
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

                    URL Build:
                    ${env.BUILD_URL}

                    Resultados de pruebas:
                    ${env.BUILD_URL}testReport/

                    Calidad SonarQube:
                    http://localhost:9000/dashboard?id=ucp-app-react

                    El pipeline incluye analisis de seguridad con Snyk.
                """,
                to: 'mateoarroyave26@gmail.com'
            )
        }

        success {
            script {
                withCredentials([
                    string(
                        credentialsId: 'telegram-bot-token',
                        variable: 'TELEGRAM_BOT_TOKEN'
                    ),
                    string(
                        credentialsId: 'telegram-chat-id',
                        variable: 'TELEGRAM_CHAT_ID'
                    )
                ]) {
                    sh '''
MESSAGE="JENKINS CI

Proyecto: ucp-app-react
Build: #${BUILD_NUMBER}
Rama: main
Estado: SUCCESS

Pruebas: OK
Build: OK
Snyk: OK
SonarQube: OK
Quality Gate: aprobado

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

        unstable {
            script {
                withCredentials([
                    string(
                        credentialsId: 'telegram-bot-token',
                        variable: 'TELEGRAM_BOT_TOKEN'
                    ),
                    string(
                        credentialsId: 'telegram-chat-id',
                        variable: 'TELEGRAM_CHAT_ID'
                    )
                ]) {
                    sh '''
MESSAGE="ALERTA DE SEGURIDAD - JENKINS CI

Proyecto: ucp-app-react
Build: #${BUILD_NUMBER}
Rama: main
Estado: UNSTABLE

Snyk detecto vulnerabilidades HIGH o CRITICAL.

Revisar Security Scan with Snyk
en el Console Output de Jenkins.

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
                    string(
                        credentialsId: 'telegram-bot-token',
                        variable: 'TELEGRAM_BOT_TOKEN'
                    ),
                    string(
                        credentialsId: 'telegram-chat-id',
                        variable: 'TELEGRAM_CHAT_ID'
                    )
                ]) {
                    sh '''
MESSAGE="ALERTA JENKINS CI

Proyecto: ucp-app-react
Build: #${BUILD_NUMBER}
Rama: main
Estado: FAILURE

El pipeline fallo durante pruebas,
build, Snyk, SonarQube o Quality Gate.

Revisar Console Output.

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