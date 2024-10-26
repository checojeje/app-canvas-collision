// Obtener el canvas existente
const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.originalColor = color;
        this.color = color;
        this.text = text;
        this.speed = speed;
        // Velocidad inicial aleatoria en ambas direcciones
        this.dx = (Math.random() - 0.5) * 2 * this.speed;
        this.dy = (Math.random() - 0.5) * 2 * this.speed;
        this.mass = radius;
        this.flashDuration = 0;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    // Función para detectar colisión con otro círculo
    checkCollision(otherCircle) {
        const dx = this.posX - otherCircle.posX;
        const dy = this.posY - otherCircle.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + otherCircle.radius);
    }

    // Función para resolver la colisión entre dos círculos
    resolveCollision(otherCircle) {
        const xVelocityDiff = this.dx - otherCircle.dx;
        const yVelocityDiff = this.dy - otherCircle.dy;
        const xDist = otherCircle.posX - this.posX;
        const yDist = otherCircle.posY - this.posY;

        // Solo resolver la colisión si los círculos se están acercando
        if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
            // Calcular el ángulo de colisión
            const angle = -Math.atan2(yDist, xDist);
            
            // Calcular las velocidades después de la colisión
            const u1 = this.rotateVector(this.dx, this.dy, angle);
            const u2 = this.rotateVector(otherCircle.dx, otherCircle.dy, angle);

            // Intercambiar las velocidades (colisión elástica perfecta)
            this.dx = this.rotateVector(u2.x, u1.y, -angle).x;
            this.dy = this.rotateVector(u2.x, u1.y, -angle).y;
            otherCircle.dx = this.rotateVector(u1.x, u2.y, -angle).x;
            otherCircle.dy = this.rotateVector(u1.x, u2.y, -angle).y;

            // Activar el efecto de flash
            this.flashDuration = 5;
            otherCircle.flashDuration = 5;
        }
    }

    rotateVector(x, y, angle) {
        return {
            x: x * Math.cos(angle) - y * Math.sin(angle),
            y: x * Math.sin(angle) + y * Math.cos(angle)
        };
    }

    update(context, circles) {
        // Manejar el efecto de flash
        if (this.flashDuration > 0) {
            this.color = "#0000FF";
            this.flashDuration--;
        } else {
            this.color = this.originalColor;
        }

        // Detectar y resolver colisiones con otros círculos
        for (let circle of circles) {
            if (circle === this) continue;
            if (this.checkCollision(circle)) {
                this.resolveCollision(circle);
            }
        }

        // Actualizar posición
        this.posX += this.dx;
        this.posY += this.dy;

        // Rebote en los bordes del canvas
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }

        // Asegurar que los círculos no se salgan del canvas
        this.posX = Math.max(this.radius, Math.min(window_width - this.radius, this.posX));
        this.posY = Math.max(this.radius, Math.min(window_height - this.radius, this.posY));

        this.draw(context);
    }
}

// Crear un array para almacenar los círculos
let circles = [];

// Función para generar círculos aleatorios
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        let color = `#${Math.floor(Math.random()*16777215).toString(16)}`; // Color aleatorio
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5
        let text = `C${i + 1}`; // Etiqueta del círculo
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

// Función para animar los círculos
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas
    circles.forEach(circle => {
        circle.update(ctx, circles);
    });
    requestAnimationFrame(animate);
}

// Generar 10 círculos y comenzar la animación
generateCircles(10);
animate();