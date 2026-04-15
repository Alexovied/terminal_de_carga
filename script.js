/* ============================================================
   RAC — Reconocimiento y Clasificación de Residuos
   Lógica principal: validación, preview, envío y notificaciones
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ── Referencias al DOM ──────────────────────────────────────
    const form = document.getElementById('rac-form');
    const tipoResiduo = document.getElementById('tipo-residuo');
    const imagenInput = document.getElementById('imagen-residuo');
    const uploadZone = document.getElementById('upload-zone');
    const previewBox = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeBtn = document.getElementById('remove-image');
    const nombreResiduo = document.getElementById('nombre-residuo');
    const fecha = document.getElementById('fecha');
    const btnSubmit = document.getElementById('btn-submit');

    // ── Fecha por defecto: hoy ──────────────────────────────────
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    fecha.value = `${yyyy}-${mm}-${dd}`;
    validarCampo(fecha); // marcar como válido de entrada

    // ── Utilidad: notificación con Toastify ─────────────────────
    function notificar(mensaje, tipo = 'info') {
        const colores = {
            success: 'linear-gradient(135deg, #4A5229, #646E3C)',
            error: 'linear-gradient(135deg, #8B2020, #C44040)',
            info: 'linear-gradient(135deg, #333, #555)'
        };

        Toastify({
            text: mensaje,
            duration: 3500,
            gravity: 'top',
            position: 'right',
            stopOnFocus: true,
            style: { background: colores[tipo] || colores.info },
            offset: { y: 16 }
        }).showToast();
    }

    // ── Validación de un campo individual ───────────────────────
    function validarCampo(campo) {
        // Para el select, "" se considera vacío
        const valor = campo.value.trim();
        const esValido = valor !== '';

        campo.classList.toggle('is-valid', esValido);
        campo.classList.toggle('is-invalid', !esValido);

        return esValido;
    }

    // ── Validación de la zona de imagen ─────────────────────────
    function validarImagen() {
        const tieneArchivo = imagenInput.files && imagenInput.files.length > 0;
        uploadZone.classList.toggle('is-valid', tieneArchivo);
        uploadZone.classList.toggle('is-invalid', !tieneArchivo);
        return tieneArchivo;
    }

    // ── Preview de imagen con FileReader ────────────────────────
    function mostrarPreview(file) {
        if (!file || !file.type.startsWith('image/')) {
            notificar('El archivo seleccionado no es una imagen válida.', 'error');
            return;
        }

        // Limitar tamaño (10 MB)
        if (file.size > 10 * 1024 * 1024) {
            notificar('La imagen excede el límite de 10 MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewBox.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    function limpiarPreview() {
        imagenInput.value = '';
        previewImg.src = '';
        previewBox.classList.remove('active');
        uploadZone.classList.remove('is-valid', 'is-invalid');
    }

    // ── Eventos: Imagen ─────────────────────────────────────────
    imagenInput.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            mostrarPreview(archivo);
            validarImagen();
        }
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        limpiarPreview();
    });

    // Drag & Drop visual feedback
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const archivo = e.dataTransfer.files[0];
        if (archivo) {
            // Asignar archivo al input programáticamente
            const dt = new DataTransfer();
            dt.items.add(archivo);
            imagenInput.files = dt.files;
            mostrarPreview(archivo);
            validarImagen();
        }
    });

    // ── Eventos: Validación en tiempo real ──────────────────────
    [tipoResiduo, nombreResiduo, fecha].forEach(campo => {
        campo.addEventListener('input', () => validarCampo(campo));
        campo.addEventListener('change', () => validarCampo(campo));
    });

    // ── Envío del formulario ────────────────────────────────────
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validar todos los campos
        const valido1 = validarCampo(tipoResiduo);
        const valido2 = validarImagen();
        const valido3 = validarCampo(nombreResiduo);
        const valido4 = validarCampo(fecha);

        if (!valido1 || !valido2 || !valido3 || !valido4) {
            notificar('Por favor, completa todos los campos obligatorios.', 'error');
            return;
        }

        // Construir objeto JSON con los datos
        const datosResiduo = {
            tipo: tipoResiduo.value,
            imagen: imagenInput.files[0].name,
            nombre: nombreResiduo.value.trim(),
            fecha: fecha.value,
            timestamp: new Date().toISOString()
        };

        // Log estructurado en consola
        console.log('──── RAC: Datos del Residuo ────');
        console.log(JSON.stringify(datosResiduo, null, 2));
        console.log('────────────────────────────────');

        // Simular envío POST
        simularEnvio(datosResiduo);
    });

    // ── Simulación de envío POST ────────────────────────────────
    async function simularEnvio(datos) {
        btnSubmit.disabled = true;
        btnSubmit.classList.add('loading');

        // Simular latencia de red
        await new Promise(resolve => setTimeout(resolve, 1800));

        btnSubmit.disabled = false;
        btnSubmit.classList.remove('loading');

        notificar('Residuo registrado exitosamente.', 'success');

        // Reset del formulario
        setTimeout(() => {
            form.reset();
            limpiarPreview();

            // Restablecer fecha a hoy
            fecha.value = `${yyyy}-${mm}-${dd}`;

            // Limpiar clases de validación
            [tipoResiduo, nombreResiduo, fecha].forEach(c => {
                c.classList.remove('is-valid', 'is-invalid');
            });
            validarCampo(fecha);
        }, 600);
    }
});
