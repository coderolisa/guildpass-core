import type { FastifyInstance } from 'fastify';
import { getPrisma } from './services/prisma';
import { getMemberService } from './services/memberService';
import { AccessCheckInput } from '@guildpass/shared-types';

export function registerRoutes(app: FastifyInstance) {
  const prisma = getPrisma();
  const svc = getMemberService(prisma);

  app.get('/health', async () => ({ ok: true }));

  app.get('/v1/memberships/:wallet', {
    schema: {
      summary: 'Fetch membership status for a wallet',
      params: { type: 'object', properties: { wallet: { type: 'string' } }, required: ['wallet'] },
      response: {
        200: {
          type: 'object',
          properties: {
            wallet: { type: 'string' },
            communities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  communityId: { type: 'string' },
                  state: { type: 'string' },
                  expiresAt: { type: ['string', 'null'] },
                },
              },
            },
          },
        },
      },
    },
  }, async (req) => {
    // @ts-ignore
    const wallet: string = req.params.wallet;
    return svc.getMembershipsByWallet(wallet);
  });

  app.get('/v1/members/:wallet', {
    schema: {
      summary: 'Fetch a member profile by wallet',
      params: { type: 'object', properties: { wallet: { type: 'string' } }, required: ['wallet'] },
    },
  }, async (req, reply) => {
    // @ts-ignore
    const wallet: string = req.params.wallet;
    const profile = await svc.getProfileByWallet(wallet);
    if (!profile) return reply.code(404).send({ message: 'Not found' });
    return profile;
  });

  app.post('/v1/access/check', {
    schema: {
      summary: 'Perform an access check for a wallet, community, and resource',
      body: {
        type: 'object',
        properties: {
          wallet: { type: 'string' },
          communityId: { type: 'string' },
          resource: { type: 'string' }
        },
        required: ['wallet', 'communityId', 'resource']
      }
    }
  }, async (req) => {
    const body = req.body as AccessCheckInput;
    return svc.checkAccess(body);
  });

  app.get('/v1/communities/:communityId/members', {
    schema: {
      summary: 'List simple community member data for admins',
      params: { type: 'object', properties: { communityId: { type: 'string' } }, required: ['communityId'] },
      querystring: { type: 'object', properties: { role: { type: 'string' } } }
    }
  }, async (req) => {
    // @ts-ignore
    const communityId: string = req.params.communityId;
    // @ts-ignore
    const role: string | undefined = (req.query as any).role;
    return svc.listMembersForAdmin(communityId, role as any);
  });
}
