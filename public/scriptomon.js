document.addEventListener('DOMContentLoaded', loadMenu);

function loadMenu() {
    fetch('/menu')
    .then(response => response.json())
    .then(data => {
        const menuContainer = document.getElementById('menu-container');

   const groupedMenu = {};
data.forEach(item => {
    if(item.properties && item.properties.categoria && item.properties.categoria.multi_select[0]) {
        const category = item.properties.categoria.multi_select[0].name;
        if (!groupedMenu[category]) groupedMenu[category] = [];
        groupedMenu[category].push(item);
    }
});


const navList = document.querySelector('.nav-list');

Object.keys(groupedMenu).forEach(category => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + category.replace(/\s+/g, '-').toLowerCase();  // Asegúrate de que esto coincida con cómo generas los IDs
    link.innerText = category;
    listItem.appendChild(link);
    navList.appendChild(listItem);


            groupedMenu[category].forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.classList.add('menu-item');
            
                // Verifica si la propiedad "url-imagen" y su valor "url" existen
                if (item.properties["url-imagen"] && item.properties["url-imagen"].url) {
                    const image = document.createElement('img');
                    image.src = item.properties["url-imagen"].url;
                    image.alt = item.properties.nombre.title[0].plain_text;
                    menuItem.appendChild(image);
                } else {
                    // Opcionalmente, puedes crear un div con una clase específica que tenga un fondo o algo similar para ítems sin imágenes.
                    const imagePlaceholder = document.createElement('div');
                    imagePlaceholder.classList.add('image-placeholder');
                    menuItem.appendChild(imagePlaceholder);
                }
            
                // ... (resto del código)
           
            

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
                editButton.classList.add('btn-especial');  // Agregar la clase 'btn-especial'
                menuItem.appendChild(editButton);
              
                

                menuContainer.appendChild(menuItem);
            });
        });
   const addButton = document.createElement('button');
addButton.innerText = 'Agregar nuevo elemento';
addButton.onclick = () => showAddForm();
addButton.classList.add('btn-especial');  // Agregar la clase 'btn-especial'
menuContainer.appendChild(addButton);

    })
    .catch(error => {
        console.error("Error loading menu data:", error);
    });
    // Al final de tu función loadMenu()
    updateButtonVisibility();

}

function showEditForm(item) {
    const { id, properties } = item;

    Swal.fire({
        title: 'Editar ítem',
        html: `
            <input id="swal-input-name" class="swal2-input" value="${properties.nombre.title[0].plain_text}" placeholder="Nombre">
            <input id="swal-input-price" class="swal2-input" value="${properties.precio.number}" placeholder="Precio">
            <input id="swal-input-image-url" class="swal2-input" value="${properties["url-imagen"] ? properties["url-imagen"].url : ''}" placeholder="URL de imagen">
            <textarea id="swal-input-description" class="swal2-textarea">${properties.descripcion.rich_text[0]?.plain_text || ''}</textarea>
            <button id="swal-delete-button" class="swal2-delete-button">Eliminar</button>

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
   // Si imageUrl está vacío, configurarlo como null
   if (updatedData.imageUrl === "") {
    updatedData.imageUrl = null;
}
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
     // Escucha del botón de eliminar
     document.getElementById('swal-delete-button').addEventListener('click', () => {
        deleteItem(item.id);
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
            // <select id="swal-input-category" class="swal2-input">
            //     <option value="platos">Platos</option>
            //     <option value="tragos">Tragos</option>
            //     <option value="postres">Postres</option>
            //     <option value="bebidas">Bebidas</option> 
            // </select>
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
            
            if (newData.imageUrl === "") {
                newData.imageUrl = null;  // Configurar como null si está vacío
            }
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
    );
}
document.getElementById('loginButton').addEventListener('click', function() {
    Swal.fire({
      title: 'Inicio de sesión',
      html: `
        <label for="swal-input-password">Contraseña</label>
        <input id="swal-input-password" class="swal2-input" type="password">
      `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input-password').value
        ];
      }
    }).then(result => {
      if (result.isConfirmed) {
        const [password] = result.value;
        checkPassword(password);
      }
    });
  });

  function deleteItem(itemId) {
    fetch(`/delete-item/${itemId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.close();  // Cerrar el modal actual
            location.reload();  // Recargar la página
        } else {
            Swal.fire('Error', 'No se pudo eliminar el ítem.', 'error');
        }
    });
}
const mobileMenuButton = document.getElementById("mobile-menu");
const navList = document.querySelector(".nav-list");

mobileMenuButton.addEventListener("click", () => {
  navList.classList.toggle("active");
  mobileMenuButton.classList.toggle("toggle");
});
