if [[ "$1" == "-l" ]]
then
	IP=localhost
else
	IP=$(ipconfig getifaddr en0)
fi

sed -i "" "s/REACT_APP_MIOIP=.*/REACT_APP_MIOIP=${IP}/g" ./srcs/frontend/.env
sed -i "" "s/HOST=.*/HOST=${IP}/g" ./srcs/backend/.env

docker-compose up --build
