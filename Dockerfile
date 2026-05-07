FROM node:18

# السطر ده بيجبر السيرفر ينزل متصفح كروم بكل ملفاته اللي كانت بتعمل كراش
RUN apt-get update && apt-get install -y chromium

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["node", "index.js"]
