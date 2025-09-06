import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const VERCEL_WEBHOOK_SECRET = process.env.VERCEL_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-vercel-signature');

        // Verify webhook signature
        if (VERCEL_WEBHOOK_SECRET && signature) {
            const expectedSignature = crypto
                .createHmac('sha1', VERCEL_WEBHOOK_SECRET)
                .update(body)
                .digest('hex');

            if (signature !== expectedSignature) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const event = JSON.parse(body);
        const deployment = event.payload.deployment;
        const project = deployment?.project;

        // Extract comprehensive deployment info
        const deploymentInfo = {
            url: deployment?.url,
            environment: deployment?.target || 'preview',
            branch: deployment?.meta?.branchAlias || deployment?.meta?.branch || 'main',
            commit: deployment?.meta?.commitSha?.substring(0, 7),
            commitMessage: deployment?.meta?.commitMessage,
            author: deployment?.meta?.commitAuthorName,
            duration: deployment?.duration ? Math.round(deployment.duration / 1000) : null,
            functionsCount: deployment?.functions?.length || 0,
            buildCommand: deployment?.meta?.buildCommand,
            framework: deployment?.meta?.framework,
        };

        let embed;

        switch (event.type) {
            case 'deployment.created':
                embed = {
                    title: `🚀 Deployment Started`,
                    description: `**Project:** ${project?.name || 'rosendohq'}\n**Environment:** ${deploymentInfo.environment}\n**Branch:** \`${deploymentInfo.branch}\``,
                    color: 0xffa500, // Orange
                    fields: [
                        {
                            name: "Commit",
                            value: deploymentInfo.commit ? `\`${deploymentInfo.commit}\`` : 'Unknown',
                            inline: true
                        },
                        {
                            name: "Author",
                            value: deploymentInfo.author || 'Unknown',
                            inline: true
                        },
                        {
                            name: "Framework",
                            value: deploymentInfo.framework || 'Next.js',
                            inline: true
                        }
                    ],
                    timestamp: new Date().toISOString(),
                };
                break;

            case 'deployment.succeeded':
                embed = {
                    title: `✅ Deployment Successful`,
                    description: `**Project:** ${project?.name || 'rosendohq'}\n**Environment:** ${deploymentInfo.environment}`,
                    color: 0x00ff00, // Green
                    url: `https://${deploymentInfo.url}`,
                    fields: [
                        {
                            name: "🌐 Live URL",
                            value: `[${deploymentInfo.url}](https://${deploymentInfo.url})`,
                            inline: false
                        },
                        {
                            name: "⏱️ Build Duration",
                            value: deploymentInfo.duration ? `${deploymentInfo.duration}s` : 'Unknown',
                            inline: true
                        },
                        {
                            name: "🔧 Functions",
                            value: deploymentInfo.functionsCount.toString(),
                            inline: true
                        },
                        {
                            name: "🌿 Branch",
                            value: `\`${deploymentInfo.branch}\``,
                            inline: true
                        },
                        {
                            name: "📝 Commit",
                            value: deploymentInfo.commitMessage ?
                                `\`${deploymentInfo.commit}\` ${deploymentInfo.commitMessage.substring(0, 100)}${deploymentInfo.commitMessage.length > 100 ? '...' : ''}` :
                                `\`${deploymentInfo.commit || 'Unknown'}\``,
                            inline: false
                        }
                    ],
                    timestamp: new Date().toISOString(),
                };
                break;

            case 'deployment.error':
                embed = {
                    title: `❌ Deployment Failed`,
                    description: `**Project:** ${project?.name || 'rosendohq'}\n**Environment:** ${deploymentInfo.environment}`,
                    color: 0xff0000, // Red
                    fields: [
                        {
                            name: "🌿 Branch",
                            value: `\`${deploymentInfo.branch}\``,
                            inline: true
                        },
                        {
                            name: "📝 Commit",
                            value: deploymentInfo.commit ? `\`${deploymentInfo.commit}\`` : 'Unknown',
                            inline: true
                        },
                        {
                            name: "👤 Author",
                            value: deploymentInfo.author || 'Unknown',
                            inline: true
                        },
                        {
                            name: "💬 Last Commit",
                            value: deploymentInfo.commitMessage?.substring(0, 200) || 'No message',
                            inline: false
                        }
                    ],
                    timestamp: new Date().toISOString(),
                };
                break;

            case 'deployment.cancelled':
                embed = {
                    title: `⏹️ Deployment Cancelled`,
                    description: `**Project:** ${project?.name || 'rosendohq'}\n**Environment:** ${deploymentInfo.environment}`,
                    color: 0x808080, // Gray
                    fields: [
                        {
                            name: "🌿 Branch",
                            value: `\`${deploymentInfo.branch}\``,
                            inline: true
                        },
                        {
                            name: "📝 Commit",
                            value: deploymentInfo.commit ? `\`${deploymentInfo.commit}\`` : 'Unknown',
                            inline: true
                        }
                    ],
                    timestamp: new Date().toISOString(),
                };
                break;

            default:
                embed = {
                    title: `📋 ${event.type}`,
                    description: `**Project:** ${project?.name || 'rosendohq'}`,
                    color: 0x5865f2, // Discord blurple
                    timestamp: new Date().toISOString(),
                };
        }

        // Send to Discord
        if (DISCORD_WEBHOOK_URL) {
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    embeds: [embed]
                }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}