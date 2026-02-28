const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Se estiver no Node 18+ pode usar o fetch nativo

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// CONFIGURAÇÃO DO SEU GITHUB
const GITHUB_CONFIG = {
    user: 'pitocoofc',
    repo: 'banco',
    branch: 'main'
};

// FUNÇÃO SPARQL (CONHECIMENTO GLOBAL)
async function fetchGlobalData(keyword) {
    const formattedKey = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
    const sparqlQuery = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        SELECT ?resumo WHERE {
            ?entidade rdfs:label "${formattedKey}"@pt ;
                      dbo:abstract ?resumo .
            FILTER (lang(?resumo) = "pt")
        } LIMIT 1
    `;
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;

    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'DiscordBot/1.0' } });
        const data = await response.json();
        return data.results.bindings.length > 0 ? data.results.bindings[0].resumo.value : null;
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
      
