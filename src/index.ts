import OpenAI from 'openai';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		return new Response('Hello World!');
	},
} satisfies ExportedHandler<Env>;
