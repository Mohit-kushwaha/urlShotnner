import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors'
import Url from './models/Url.js';
import cron from 'node-cron'
import urlsRouter from './routes/urlShortnerRoute.js';
import userRouter from './routes/userRoute.js'

dotenv.config({ path: './config/.env' });
const app = express();
//method to connect to DB
connectDB();

app.use(cors())
app.use(express.json());
app.use(bodyParser.json())
//base routes
app.use('/', userRouter);
app.use('/api', urlsRouter);

// Server Setup

const PORT = process.env.PORT || 3333;
app.listen(PORT, () =>
{
  console.log(`Server is running at PORT ${ PORT }`);
});
//scheduling cron job for 1days
cron.schedule("* * * */1 * *", async function ()
{
  //get the all urls from url collection
  const allUrls = await Url.find()
  allUrls.forEach(async (userInfo) =>
  {
    const d1 = new Date(userInfo.lastAcessDate);
    const d2 = new Date()

    const dates = daysBetween(d1, d2);
    //if last access date of url is greater than 30 days
    if (dates > 30)
    {
      await Url.deleteOne({ _id: userInfo._id })
    }
  })

});
// days between today and now
function daysBetween(first, second)
{

  // Copy date parts of the timestamps, discarding the time parts.
  var date1 = new Date(first.getFullYear(), first.getMonth(), first.getDate());
  var date2 = new Date(second.getFullYear(), second.getMonth(), second.getDate());

  // Do the math.
  var millisecondsPerDay = 1000 * 60 * 60 * 24;
  var millisBetween = date2.getTime() - date1.getTime();
  var days = millisBetween / millisecondsPerDay;

  // Round down.
  return Math.floor(days);
}