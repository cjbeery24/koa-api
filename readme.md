## Setup

1. Install dependencies

```
npm install
```

2. Copy .env.example to .env.local and populate it

```
cp .env.example .env.local
```

3. Create database tables if the don't already exist

```
npm run db-sync-local
```

4. Run Local Server

```
npm run local
```

### Testing

1. Copy .env.example to .env.test and populate it

```
cp .env.example .env.test
```

2. Run tests

```
npm run test
```
