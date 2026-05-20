# Food For All

A web platform connecting **donors** (restaurants, hotels, grocery shops, event organizers), **NGOs**, and **volunteers** to donate and distribute surplus food to people in need.

## Tech stack

| Layer        | Technology        |
| ------------ | ----------------- |
| Frontend     | React + Vite      |
| Backend      | Node.js + Express |
| Database     | MongoDB           |
| Auth         | JWT               |
| Maps         | Google Maps (link) |

## Project structure

```
food-for-all/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── api/
└── server/          # Express API
    ├── models/
    ├── routes/
    ├── controllers/
    ├── middleware/
    └── config/
```

## Workflow

1. **Donor** posts food → status `pending`
2. **NGO** accepts → status `accepted`
3. **Volunteer** picks task → status `assigned`
4. Volunteer marks **picked up** → `picked_up`
5. Volunteer marks **delivered** → `delivered`

## API reference

### Authentication

| Method | Endpoint      | Description   |
| ------ | ------------- | ------------- |
| POST   | `/api/register` | Register user |
| POST   | `/api/login`    | Login         |
| GET    | `/api/me`       | Current user (JWT) |

### Donations

| Method | Endpoint            | Role        |
| ------ | ------------------- | ----------- |
| POST   | `/api/donate`       | donor       |
| GET    | `/api/donations`    | all         |
| PUT    | `/api/donation/:id` | donor/ngo/admin |
| DELETE | `/api/donation/:id` | donor/admin |

### Delivery

| Method | Endpoint                    | Role          |
| ------ | --------------------------- | ------------- |
| POST   | `/api/assign-volunteer`     | ngo, admin    |
| POST   | `/api/pick-task`            | volunteer     |
| GET    | `/api/deliveries`           | all           |
| PUT    | `/api/delivery-status/:id`  | volunteer/ngo |

### Admin

| Method | Endpoint              |
| ------ | --------------------- |
| GET    | `/api/admin/users`    |
| DELETE | `/api/admin/users/:id` |
| GET    | `/api/admin/analytics` |

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### Backend

```bash
cd server
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET
npm install
npm run dev
```

Server runs at `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:3000` (proxies `/api` to the backend).

### Create an admin user

Register via UI with role **donor**, then in MongoDB set `role: "admin"` for that user, or use Compass/shell:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Roles

| Role       | Capabilities                                      |
| ---------- | ------------------------------------------------- |
| `donor`    | Post food, view own donations                     |
| `ngo`      | Accept pending donations, track deliveries        |
| `volunteer`| Pick tasks, update delivery status, open Maps     |
| `admin`    | Users, analytics, remove fake donations           |

## Roadmap (from your plan)

- [ ] Google Maps embed + geolocation matching
- [ ] Donation badges / certificates
- [ ] AI recommendations, hunger heatmap, route optimization, QR verification

## Deploy

- **Backend:** [Render](https://render.com) — set `MONGODB_URI`, `JWT_SECRET`, `PORT`
- **Frontend:** [Firebase Hosting](https://firebase.google.com) or Render static site — set API base URL if not using proxy

## License

MIT — use for learning and social impact projects.
