const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

class NdjLibrary {
    constructor(config) {
        this.token = config.token;
        this.user = config.githubUser || 'pitocoofc';
        this.repo = config.githubRepo || 'banco';
        this.branch = config.branch || 'main';
        
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
    }

    // Método para buscar o TXT no seu GitHub Raw
    async getInfo(tema) {
        const cleanKey = tema.toLowerCase().trim().replace(/\s+/g, '_');
        const url = `https://raw.githubusercontent.com/${this.user}/${this.repo}/${this.branch}/${cleanKey}.txt`;
        
        try {
            const res = await fetch(url);
            return res.ok ? await res.text() : null;
        } catch (e) {
            return null;
        }
    }

    // Inicia o bot e já configura o comando de busca
    iniciar() {
        this.client.on('ready', () => {
            console.log(`✅ Ndj-lib Conectada! Bot: ${this.client.user.tag}`);
            console.log(`📚 Repositório de Conhecimento: ${this.repo}`);
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot || !message.content.startsWith('!saber')) return;

            const termo = message.content.split(' ').slice(1).join(' ');
            if (!termo) return message.reply("O que você deseja saber?");

            const conteudo = await this.getInfo(termo);

            if (conteudo) {
                const embed = new EmbedBuilder()
                    .setTitle(`📖 Ndj-Lib | ${termo.toUpperCase()}`)
                    .setDescription(conteudo)
                    .setColor('#2b2d31')
                    .setFooter({ text: `Fonte: github.com/${this.user}/${this.repo}` });

                return message.reply({ embeds: [embed] });
            } else {
                return message.reply("❌ Termo não encontrado no banco de dados.");
            }
        });

        this.client.login(this.token);
    }
}

module.exports = NdjLibrary;
    } catch (e) { return null; }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!saber')) return;

    const args = message.content.split(' ');
    const query = args.slice(1).join(' ');

    if (!query) return message.reply('Digite algo para buscar! Ex: `!saber xadrez`');

    const cleanKey = query.toLowerCase().trim().replace(/\s+/g, '_');
    const githubUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${cleanKey}.txt`;

    try {
        // TENTA NÍVEL 1: GITHUB (SEU TEXTO PERSONALIZADO)
        const ghResponse = await fetch(githubUrl);

        if (ghResponse.ok) {
            const textoPuro = await ghResponse.text();
            const embed = new EmbedBuilder()
                .setTitle(`📚 Biblioteca: ${query.toUpperCase()}`)
                .setDescription(textoPuro)
                .setColor('#2F3136')
                .setFooter({ text: 'Fonte: Banco de Dados Próprio (GitHub)' });

            return message.reply({ embeds: [embed] });
        }

        // TENTA NÍVEL 2: DBPEDIA (CONHECIMENTO AUTOMÁTICO)
        const fallbackTexto = await fetchGlobalData(query);

        if (fallbackTexto) {
            const embedGlobal = new EmbedBuilder()
                .setTitle(`🌐 Conhecimento Global: ${query}`)
                .setDescription(fallbackTexto.slice(0, 2048)) // Limite de caracteres do Discord
                .setColor('#5865F2')
                .setFooter({ text: 'Fonte: DBpedia/Wikipedia' });

            return message.reply({ embeds: [embedGlobal] });
        }

        message.reply('❌ Não encontrei nada sobre isso em nenhuma das minhas bases.');

    } catch (error) {
        console.error(error);
        message.reply('⚠️ Erro ao processar a consulta.');
    }
});
      
