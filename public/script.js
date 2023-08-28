document.addEventListener('DOMContentLoaded', loadMenu);

function loadMenu() {
    fetch('/menu')
    .then(response => response.json())
    .then(data => {
        const menuContainer = document.getElementById('menu-container');

        const groupedMenu = {};
        data.forEach(item => {
            const category = item.properties.categoria.select.name;
            if (!groupedMenu[category]) groupedMenu[category] = [];
            groupedMenu[category].push(item);
        });

        Object.keys(groupedMenu).forEach(category => {
            const subtitle = document.createElement('h2');
            subtitle.innerText = category;
            subtitle.classList.add('subtitulo');
            menuContainer.appendChild(subtitle);

            groupedMenu[category].forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.classList.add('menu-item');


                const image = document.createElement('img');
                image.src = item.properties["url-imagen"].url;
                image.alt = item.properties.nombre.title[0].plain_text;
                menuItem.appendChild(image);

                const title = document.createElement('h2');
                title.innerText = item.properties.nombre.title[0].plain_text;
                menuItem.appendChild(title);

                const price = document.createElement('p');
                price.innerText = `$${item.properties.precio.number}`;
                price.classList.add('price');
                menuItem.appendChild(price);

                const description = document.createElement('p');
                description.innerText = item.properties.descripcion.rich_text[0].plain_text;
                menuItem.appendChild(description);

                const editButton = document.createElement('button');
                editButton.innerText = 'Editar';
                editButton.onclick = () => showEditForm(item);
                menuItem.appendChild(editButton);

                menuContainer.appendChild(menuItem);
            });
        });
        const addButton = document.createElement('button');
addButton.innerText = 'Agregar nuevo elemento';
addButton.onclick = () => showAddForm();
menuContainer.appendChild(addButton);
    })
    .catch(error => {
        console.error("Error loading menu data:", error);
    });
    // Al final de tu función loadMenu()


}

function showEditForm(item) {
    const { id, properties } = item;

    Swal.fire({
        title: 'Editar ítem',
        html: `
            <input id="swal-input-name" class="swal2-input" value="${properties.nombre.title[0].plain_text}" placeholder="Nombre">
            <input id="swal-input-price" class="swal2-input" value="${properties.precio.number}" placeholder="Precio">
            <input id="swal-input-image-url" class="swal2-input" value="${properties["url-imagen"].url}" placeholder="URL de imagen">
            <textarea id="swal-input-description" class="swal2-textarea">${properties.descripcion.rich_text[0]?.plain_text || ''}</textarea>
        `,
        focusConfirm: false,
        preConfirm: () => {
            return {
                name: document.getElementById('swal-input-name').value,
                price: parseFloat(document.getElementById('swal-input-price').value),
                imageUrl: document.getElementById('swal-input-image-url').value,
                description: document.getElementById('swal-input-description').value
            };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const updatedData = result.value;

            fetch('/update-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    itemId: id,
                    ...updatedData
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    Swal.fire('Error', 'Error al actualizar el ítem.', 'error');
                }
            });
        }
    });
}
function showAddForm() {
    Swal.fire({
        title: 'Agregar ítem',
        html: `
            <input id="swal-input-name" class="swal2-input" placeholder="Nombre">
            <input id="swal-input-price" class="swal2-input" placeholder="Precio">
            <input id="swal-input-image-url" class="swal2-input" placeholder="URL de imagen">
            <textarea id="swal-input-description" class="swal2-textarea" placeholder="Descripción"></textarea>
            <select id="swal-input-category" class="swal2-input">
                <option value="plato">Plato</option>
                <option value="bebida">Bebida</option>
                <option value="postre">Postre</option>
            </select>
        `,
        focusConfirm: false,
        preConfirm: () => {
            return {
                name: document.getElementById('swal-input-name').value,
                price: parseFloat(document.getElementById('swal-input-price').value),
                imageUrl: document.getElementById('swal-input-image-url').value,
                description: document.getElementById('swal-input-description').value,
                category: document.getElementById('swal-input-category').value
            };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const newData = result.value;
            if (result.isConfirmed) {
                const newData = result.value;
                
                fetch('/add-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        Swal.fire('Error', 'Error al añadir el nuevo ítem.', 'error');
                    }
                });
            }
                    }
    });
}
