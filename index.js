const express = require('express');
const { Client } = require('@notionhq/client');

const app = express();
const PORT = 3000;

// Inicializar el cliente de Notion
const notion = new Client({
    auth: 'secret_1JG1MN0oo2SbyxcjfLer1Qcwvv7XKonPxEL1srxeKJu'
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/menu', async (req, res) => {
    try {
        const response = await notion.databases.query({
            database_id: '35f2587452bd4416be5728aee43f2fcd'
        });
        
        // Ordenar los elementos según la categoría
        const sortedItems = response.results.sort((a, b) => {
            const order = ["plato", "bebida", "postre"];
            const aValue = a.properties.categoria && a.properties.categoria.select ? a.properties.categoria.select.name : "";
            const bValue = b.properties.categoria && b.properties.categoria.select ? b.properties.categoria.select.name : "";
            return order.indexOf(aValue) - order.indexOf(bValue);
        });
        
        res.json(sortedItems);  // Envía los elementos ordenados al frontend

    } catch (error) {
        console.error("Error fetching data from Notion:", error);
        res.status(500).json({ error: 'Error fetching data from Notion' });
    }
});

app.post('/update-item', express.json(), async (req, res) => {
    const { itemId, name, price, imageUrl, description } = req.body;
    try {
        await notion.pages.update({
            page_id: itemId,
            properties: {
                'nombre': {
                    'title': [{ 'text': { 'content': name } }]
                },
                'precio': {
                    'number': price
                },
                'url-imagen': {
                    'url': imageUrl
                },
                'descripcion': {
                    'rich_text': [{ 'text': { 'content': description } }]
                }
            }
        });
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating item in Notion:", error);  // <-- Agrega esta línea aquí
        res.status(500).json({ error: 'Error updating item in Notion' });
    }
});
