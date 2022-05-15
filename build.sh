echo 'Build NX workspace'

echo 'Build gateway'
npx nx build gateway
echo 'Build gateway: OK!'

echo 'Build token'
npx nx build token
echo 'Build token: OK!'

echo 'Build note'
npx nx build note
echo 'Build note: OK!'

echo 'Build user'
npx nx build user
echo 'Build user: OK!'
