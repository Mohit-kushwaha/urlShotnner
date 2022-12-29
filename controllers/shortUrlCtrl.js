import { nanoid } from 'nanoid';
import Url from '../models/Url.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../config/.env' });

const shortUrlController = {
    async shortUrl(req, res)
    {
        const { origUrl } = req.body;
        try
        {
            const base = process.env.BASE;
            //nanoiD generate unique Id 
            const urlId = nanoid();
            let isUrlId = await Url.findOne({ urlId });
            //if  the urlId existing
            if (isUrlId)
            {
                urlId = nanoid();
            }
            const shortUrl = `${ base }/${ urlId }`;

            let url = new Url({
                origUrl,
                shortUrl,
                urlId,
                date: new Date(),
                lastAcessDate: new Date()
            });

            await url.save();
            res.json(url);

        } catch (err)
        {
            console.log(err);
            res.status(500).json('Server Error');
        }
    },
    //get the url by Id
    async getUrlbyId(req, res)
    {
        try
        {
            const url = await Url.findOne({ urlId: req.params.urlId });
            if (url)
            {
                await Url.updateOne(
                    {
                        urlId: req.params.urlId,
                    },
                    {
                        $inc: { clicks: 1 },
                        lastAcessDate: new Date()
                    }
                );
                return res.redirect(url.origUrl);
            } else res.status(404).json('Not found');
        } catch (err)
        {
            console.log(err);
            res.status(500).json('Server Error');
        }
    }
}





export default shortUrlController