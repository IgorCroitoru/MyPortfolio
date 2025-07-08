window.initialize = function(canvas, component, direction, speed, borderColor, squareSize, hoverFillColor) {
    const ctx = canvas.getContext('2d');
    let requestId;
    let numSquaresX = 0;
    let numSquaresY = 0;
    let gridOffset = { x: 0, y: 0 };
    let hoveredSquare = null;
    let currentParams = { direction, speed, borderColor, squareSize, hoverFillColor };

    const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        numSquaresX = Math.ceil(canvas.width / squareSize) + 1;
        numSquaresY = Math.ceil(canvas.height / squareSize) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
        const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

        for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
            for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
                const squareX = x - (gridOffset.x % squareSize);
                const squareY = y - (gridOffset.y % squareSize);

                if (hoveredSquare &&
                    Math.floor((x - startX) / squareSize) === hoveredSquare.x &&
                    Math.floor((y - startY) / squareSize) === hoveredSquare.y) {
                    ctx.fillStyle = hoverFillColor;
                    ctx.fillRect(squareX, squareY, squareSize, squareSize);
                }

                ctx.strokeStyle = borderColor;
                ctx.strokeRect(squareX, squareY, squareSize, squareSize);
            }
        }

        const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
        );
        //gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        //gradient.addColorStop(1, "#060010");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateAnimation = () => {
        const effectiveSpeed = Math.max(speed, 0.1);
        switch (direction) {
            case "right":
                gridOffset.x = (gridOffset.x - effectiveSpeed + squareSize) % squareSize;
                break;
            case "left":
                gridOffset.x = (gridOffset.x + effectiveSpeed + squareSize) % squareSize;
                break;
            case "up":
                gridOffset.y = (gridOffset.y + effectiveSpeed + squareSize) % squareSize;
                break;
            case "down":
                gridOffset.y = (gridOffset.y - effectiveSpeed + squareSize) % squareSize;
                break;
            case "diagonal":
                gridOffset.x = (gridOffset.x - effectiveSpeed + squareSize) % squareSize;
                gridOffset.y = (gridOffset.y - effectiveSpeed + squareSize) % squareSize;
                break;
            default:
                break;
        }

        drawGrid();
        requestId = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
        const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

        const hoveredSquareX = Math.floor((mouseX + gridOffset.x - startX) / squareSize);
        const hoveredSquareY = Math.floor((mouseY + gridOffset.y - startY) / squareSize);

        if (!hoveredSquare || hoveredSquare.x !== hoveredSquareX || hoveredSquare.y !== hoveredSquareY) {
            hoveredSquare = { x: hoveredSquareX, y: hoveredSquareY };
            component.invokeMethodAsync('OnHover', hoveredSquareX, hoveredSquareY);
        }
    };

    const handleMouseLeave = () => {
        hoveredSquare = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    requestId = requestAnimationFrame(updateAnimation);

    // Store functions for cleanup and updates
    canvas._squares = {
        dispose: () => {
            window.removeEventListener('resize', resizeCanvas);
            if (requestId) cancelAnimationFrame(requestId);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        },
        updateParams: (newDirection, newSpeed, newBorderColor, newSquareSize, newHoverFillColor) => {
            direction = newDirection;
            speed = newSpeed;
            borderColor = newBorderColor;
            squareSize = newSquareSize;
            hoverFillColor = newHoverFillColor;
            currentParams = { direction, speed, borderColor, squareSize, hoverFillColor };
            resizeCanvas();
        }
    };
}

window.updateParameters = function(canvas, direction, speed, borderColor, squareSize, hoverFillColor) {
    if (canvas._squares) {
        canvas._squares.updateParams(direction, speed, borderColor, squareSize, hoverFillColor);
    }
}

window.dispose= function(canvas) {
    if (canvas._squares) {
        canvas._squares.dispose();
        delete canvas._squares;
    }
}

