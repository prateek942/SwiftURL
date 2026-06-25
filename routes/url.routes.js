import express from "express";
import {shortenPostRequestBodySchema} from '../validations/request.validation.js';
import {nanoid} from 'nanoid';
import {db} from '../db/index.js';
import {urlsTable} from '../models/index.js';
import { ensureAthenticated } from "../middlewares/auth.middleware.js";
import { createShortUrl } from "../services/url.service.js";
import { eq, and } from "drizzle-orm";

const router = express.Router();

router.post('/shorten',ensureAthenticated, async (req, res) => {

    const validationResult = await shortenPostRequestBodySchema.safeParseAsync(req.body);
    if(validationResult.error){ return res.status(400).json({error: validationResult.error.format()});}
    const { url,code} = validationResult.data;

    const shortCode = code ?? nanoid(6);

    const result = await createShortUrl({
      shortCode,
      targetUrl: url,
      userId: req.user.id,
    });
    return res.status(201).json({data: result});
});

router.get('/urls', ensureAthenticated, async (req, res) => {
  try {
    const result = await db
      .select()
      .from(urlsTable)
      .where(eq(urlsTable.userId, req.user.id));
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/urls/:id', ensureAthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const [deletedUrl] = await db
      .delete(urlsTable)
      .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)))
      .returning();

    if (!deletedUrl) {
      return res.status(404).json({ error: "URL not found or not owned by you" });
    }

    return res.json({ message: "URL deleted successfully", data: deletedUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:shortcode', async (req, res) => {
  const code = req.params.shortcode;
  const [result] = await db
    .select()
    .from(urlsTable)
    .where(eq(urlsTable.shortCode, code));

  if (!result) return res.status(404).json({ error: "Invalid URL" });
  return res.redirect(result.targetUrl);
});

  
export default router;