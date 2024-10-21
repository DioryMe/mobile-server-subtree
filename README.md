## Mobile-proto-server

## Run

Start redis:

```
docker run --name redis-local -p 6379:6379 -d redis
```

Start server:

```
yarn start:dev
```

## Endpoints

Content:

http://localhost:3000/room/content?cid=bafkreifhhmoftoo26lc223k5riwflm6uvgrizwakg5z7n7yruj7gty27ji&mime=video/mp4

Thumbnail:

http://localhost:3000/room/thumbnail?dioryId=5456c2c3-4a69-4d80-bd2f-caa9945cff71
