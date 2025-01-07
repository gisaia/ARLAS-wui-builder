#!/bin/bash
set -e
if  [ -z "$GITHUB_CHANGELOG_TOKEN"  ] ; then echo "Please set GITHUB_CHANGELOG_TOKEN environment variable"; exit -1; fi

function clean {
    ARG=$?
	echo "==> Exit status = $ARG"
    exit $ARG
}
trap clean EXIT

usage(){
	echo "Usage: ./release.sh -rel=X [--no-tests]"
  echo " -version                             Release ARLAS-builder X version"
	echo " --no-tests                           Skip running integration tests"
  echo " --not-latest                         Doesn't tag the release version as the latest."
  echo " -s|--stage                           Stage of the release : beta | rc | stable. If --stage is 'rc' or 'beta', there is no merge of develop into master (if -ref_branch=develop)"
  echo " -i|--stage_iteration=n               The released version will be : [x].[y].[z]-beta.[n] OR  [x].[y].[z]-rc.[n] according to the given --stage"
 	echo " -ref_branch | --reference_branch     From which branch to start the release."
  echo "    Add -ref_branch=develop for a new official release"
  echo "    Add -ref_branch=x.x.x for a maintenance release"
	exit 1
}

STAGE="stable"
TESTS="YES"
IS_LATEST_VERSION="YES"

for i in "$@"
do
case $i in
    -version=*)
    VERSION="${i#*=}"
    shift # past argument=value
    ;;
    --no-tests)
    TESTS="NO"
    shift # past argument with no value
    ;;
    --not-latest)
    IS_LATEST_VERSION="NO"
    shift # past argument with no value
    ;;
    -ref_branch=*|--reference_branch=*)
    REF_BRANCH="${i#*=}"
    shift # past argument=value
    ;;
    -s=*|--stage=*)
    STAGE="${i#*=}"
    shift # past argument=value
    ;;
    -i=*|--stage_iteration=*)
    STAGE_ITERATION="${i#*=}"
    shift # past argument=value
    ;;
    *)
      # unknown option
    ;;
esac
done

if [ -z ${REF_BRANCH+x} ];
    then
        echo ""
        echo "###########"
        echo "-ref_branch is missing."
        echo "  Add -ref_branch=develop for a new official release"
        echo "  Add -ref_branch=x.x.x for a maintenance release"
        echo "###########"
        echo ""
        usage;
fi

if [ -z ${STAGE+x} ];
    then
        echo ""
        echo "###########"
        echo "-s=*|--stage* is missing."
        echo "  Add --stage=beta|rc|stable to define the release stage"
        echo "###########"
        echo ""
        usage;
fi

if [ "${STAGE}" != "beta" ] && [ "${STAGE}" != "rc" ] && [ "${STAGE}" != "stable" ];
    then
        echo ""
        echo "###########"
        echo "Stage ${STAGE} is invalid."
        echo "  Add --stage=beta|rc|stable to define the release stage"
        echo "###########"
        echo ""
        usage;
fi

if [ "${STAGE}" == "beta" ] || [ "${STAGE}" == "rc" ];
    then
        if [ -z ${STAGE_ITERATION+x} ];
            then
                echo ""
                echo "###########"
                echo "You chose to release this version as ${STAGE}."
                echo "--stage_iteration is missing."
                echo "  Add -i=n|--stage_iteration=n, the released version will be : [x].[y].[z]-${STAGE}.[n]"
                echo "###########"
                echo ""
                usage;
        fi
fi

echo "==> Get ${REF_BRANCH} branch"
git checkout "${REF_BRANCH}"
git pull origin "${REF_BRANCH}"

if [ "$TESTS" == "YES" ]; then
  npm run lint
  npm run test
  npm run e2e
else
  echo "==> Skip tests"
fi


if [ "${STAGE}" == "rc" ] || [ "${STAGE}" == "beta" ];
    then
        VERSION="${VERSION}-${STAGE}.${STAGE_ITERATION}"
fi

echo "==> Set version"
npm --no-git-tag-version version ${VERSION}
git add package.json

echo "==> Build (the artifact will be stored in the 'dist' directory)"
npm install
npm run lint
npm run build

echo "  -- Create and push tag"
git tag -a v${VERSION} -m "Release prod version ${VERSION}"
git push origin v${VERSION}

echo "==> Generate CHANGELOG"
docker run -it --rm -v "$(pwd)":/usr/local/src/your-app gisaia/github-changelog-generator:latest github_changelog_generator \
  -u gisaia -p ARLAS-wui-builder --token ${GITHUB_CHANGELOG_TOKEN} --no-pr-wo-labels --no-issues-wo-labels --no-unreleased \
  --issue-line-labels conf,documentation,ANALYTICS,"LOOK AND FEEL",MAP,SEARCH,SIDE,TIMELINE,WIDGET \
  --exclude-labels type:duplicate,type:question,type:wontfix,type:invalid \
  --bug-labels type:bug --enhancement-labels type:enhancement --breaking-labels type:breaking \
  --enhancement-label "**New stuff:**" --issues-label "**Miscellaneous:**"

echo "  -- Remove tag to add generated CHANGELOG"
git tag -d v${VERSION}
git push origin :v${VERSION}

echo "  -- Commit release version"
git commit -a -m "Release prod version ${VERSION}"
git tag v${VERSION}
git push origin v${VERSION}
git push origin ${REF_BRANCH}

echo "==> Docker"
docker build --no-cache --build-arg version=${VERSION} --tag gisaia/arlas-wui-builder:${VERSION} .

echo "  -- Publish docker image"
docker push gisaia/arlas-wui-builder:${VERSION}
if [ "${STAGE}" == "stable" ] && [ "${IS_LATEST_VERSION}" == "YES" ];
    then
    echo "  -- Publish latest"
    docker tag gisaia/arlas-wui-builder:${VERSION} gisaia/arlas-wui-builder:latest
    docker push gisaia/arlas-wui-builder:latest
fi

if [ "${REF_BRANCH}" == "develop" ] && [ "${STAGE}" == "stable" ];
    then
    echo "==> Merge develop into master"
    git checkout master
    git pull origin master
    git merge origin/develop
    git push origin master

    git checkout develop
    git pull origin develop
    git rebase origin/master
fi

IFS='.' read -ra TAB <<< "$VERSION"
major=${TAB[0]}
minor=${TAB[1]}
newminor=$(( $minor + 1 ))
newDevVersion=${major}.${newminor}.0

npm --no-git-tag-version version "${newDevVersion}-dev"

git commit -a -m "Set development version to ${newDevVersion}-dev"
git push origin ${REF_BRANCH}

echo "==> Well done :)"
