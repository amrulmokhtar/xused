#!/bin/sh
# Command to easily make production branch commit
RED='\033[1;31m'
deploy(){
  echo "${RED}Checking that you've committed everything"
  git commit -at normal_commit.template
  echo "Swapping to production branch"
  git checkout production
  echo "Merging your feature into production. This may give a merge issue"
  git merge master
  echo "Saving merge results"
  rc=$?
  if [[ rc == 1 ]]; then
    git mergetool
  fi
  #else
  git commit -at production_commit.template
  #fi
  echo "Checking that the db is set to production"

  if grep -Fxq 'var itemDB = "/items/";' ./js/firebase-setup.js
  then
    echo "Database is correct, deploying to firebase"
    firebase deploy
  fi

  echo "Finished deploying, saving deployment code to git"
  git push
  echo "Swapping back to development branch"
  git checkout master
}

echo "Are you sure you want to deploy this to master?"
git --no-pager log --oneline -4

echo "Do you want to continue (use numbers)"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) deploy; break;;
        No ) exit;;
    esac
done
