void setBuildStatus(String message, String state) {
  step([
      $class: "GitHubCommitStatusSetter",
      reposSource: [$class: "ManuallyEnteredRepositorySource", url: "https://github.com/Flow-PDA/WS-Server.git"],
      contextSource: [$class: "ManuallyEnteredCommitContextSource", context: "ci/jenkins/build-status"],
      errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
      statusResultSource: [ $class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]] ]
  ]);
}

pipeline {
  agent any
	post {
    failure {
      setBuildStatus("Build failed", "FAILURE");
    }
    success {
      setBuildStatus("Build succeeded", "SUCCESS");
    }
  }
  stages {
    stage('init') {
        steps {
            echo 'init pipeline, check changes'
            setBuildStatus("Pending", "PENDING")
        }
    }
    stage('cofing') {
      steps {
        echo 'copy configuration files'
        sh 'pwd'
        sh 'cp /var/jenkins_home/workspace/config/.env.stock-server .env'
      }
    }
    stage('build') {
      steps {
        echo 'build express'
        sh 'docker-compose -p ws-server build'
      }
    }
    stage('stop') {
      steps {
        echo 'stop container'
        sh 'docker-compose -p ws-server stop express'
        echo 'remove container'
        sh 'docker-compose -p ws-server rm -f'
      }
    }
    stage('deploy') {
      steps {
        echo 'run docker container'
        sh 'docker-compose -p ws-server up -d'
      }
    }
  }
}
