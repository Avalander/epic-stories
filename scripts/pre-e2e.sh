mkdir -p .e2e
rm -rf .e2e/*

cp -a e2e/.env e2e/data .e2e/

cp -a .build/* .e2e/

cd .e2e/
npm i --only=production
