
/*Ancho y alto del div de fondo de la aplicación */
// VARIABLES GLOBALES

var anchoFondo = document.getElementsByClassName('fondo')[0].clientWidth -					//ancho_fondo =
				 document.getElementById('plantilla').clientWidth - 50;		
var altoFondo = document.getElementsByClassName('fondo')[0].clientHeight -
				document.getElementsByClassName('barra-inferior')[0].clientHeight - 20;		//alto_fondo =

let objetoJuego = null;

/*clase personaje*/
class Cerdo {		//class Cerdo{
	constructor(id) {			//constructor(id){
		function random() {
			/*funcion random() devuelve valor aleatorio entre -5 y 5*/
			//return Math.random() * (5 - -5) + -5;

			//La condición expresada en el enunciado es ERRÓNEA. Si el valor = 0 no habrá movimiento y si el valor es negativo, se moverá hacia arriba ??
			return Math.random() * 5;
		}

		function randomXPosition() {
			return Math.floor(Math.random() * anchoFondo);
        }

		// variable random_posicion_x : Guarda la posicion aleatoria en el eje x dentro de mi ventana
		let random_position_x = randomXPosition();

		// PROPIEDADES
		this.id = id;											// this.id = id
		this.vida = 1;											// this.vida = 1
		this.top = 0;											// this.top = 0
		this.left = random_position_x;							// this.left = random_posicion_x
		this.velx = 0;											// this.velx = 0
		this.vely = random();									// this.vely = random()
		this.estado = 'esperando';								// this.estado = 'esperando' //puede valer salvado, muerto, esperando o volando
		this.clon = '';											// this.clon = '' //Guarda el html correspondiente al cerdo
		this.partida = null;
	}

	establecerObjetoPartida(partida) {
		this.partida = partida;
    }

	// método Jugar()
	jugar() {													//jugar(){
		function clonarTag(tagId, nuevoId) {
			let htmlTag = document.getElementById(tagId).tagName;
			let nuevoObjeto = document.createElement(htmlTag);
			nuevoObjeto.id = nuevoId;
			nuevoObjeto.classList = document.getElementById(tagId).classList;

			return nuevoObjeto;
		}

		//Guardamos en this.clon un clon del div #plantilla
		//añadimos a this.clon el atributo id correspondiente a la propiedad this.id del objeto

		this.clon = clonarTag('plantilla', this.id);

		// cambiamos la propiedad css left para que coincida con this.left
		this.clon.style.left = this.left.toString() + "px";

		//Añado el html de this.clon al div .fondo
		document.getElementsByClassName('fondo')[0].appendChild(this.clon);

		let that = this;

		//Añadimos listener de click a this.clon 
		this.clon.onclick = function () {						//Si click en cerdo...						
			that.clon.onclick = null;

			that.estado = 'salvado';							//cambiamos this.estado a salvado
			that.clon.classList += ' feliz';					//Añadimos la clase feliz al cerdo
						
			//incrementamos la propiedad cerdos_salvados del objeto partida			
			let cerdosActuales = that.partida.incrementarCerdosSalvados();

			//Actualizamos el el dom para que aparezcan los cerdos salvados en pantalla
			document.getElementById('div_cerdos_salvados').innerText = cerdosActuales.toString();	

			//Cargamos sonido y reproducimos	
			let audio = new Audio('sonidos/oink.mp3');
			audio.play();

			//Ponemos temporizador para que al cabo de un segundo se llame al metodo borrarCerdo			
			let intervalo = setInterval(function (cerdo) {
				clearTimeout(intervalo);
				cerdo.borrarCerdo();
			}, 1 * 1000, that);
		};
	}

	matarCerdo() {												// método matarCerdo()
		this.estado = 'muerto';									// cambiamos propiedad estado del cerdo a 'muerto'
		this.clon.classList += ' hot';							// añadimos al clon la clase 'hot'		
		this.clon.style.top = (altoFondo + 35).toString() + "px";
				
		//eliminamos la clase 'cerdo'
		let clasesActuales = this.clon.className.split(' ').filter(x => x != 'cerdo');
		this.clon.className = clasesActuales.join(' ');

		//incrementamos la propiedad cerdos_muertos del objeto 'juego'
		let cerdosMuertosActuales = this.partida.incrementarCerdosMuertos();

		//insertamos en pantalla los cerdos muertos
		document.getElementById('div_cerdos_muertos').innerText = cerdosMuertosActuales.toString();

		//cargamos y reproducimos el sonido del cerdo muerto
		let audio = new Audio('sonidos/chilla.mp3');
		audio.play();
	}

	moverCerdo() {	// método mover()
		if (this.estado == 'volando') {							// miramos si el estado del cerdo es 'volando'. En caso afirmativo...			
			if (this.top >= altoFondo) {						// comprobamos que el cerdo ha llegado al final de la pantalla. Si es así...
				this.matarCerdo();								// llamamos al método martarCerdo()			
			}
			else {												// Si aún está volando 
				let speed = 5 * this.vely;						// Calcular velocidad
				if (speed < 2) speed = 2;						// Mínimo de velocidad

				this.top += speed;								//incrementamos la posición top del cerdo !! POR LA VELOCIDAD DE Y ??? 

				//Actualizamos el propiedad CSS top del clon con el valor this.top
				document.getElementById(this.id).style.top = this.top.toString() + 'px';
			}
		}
	}

	borrarCerdo() {												// método borrarCerdo()
		//Cambiamos el valor de la propiedad display del cerdo por 'none'
		document.getElementById(this.id).style = 'display: none;';
	}
}

// ******************* clase juego *************************************
class Juego {								//class Juego{
	// CONTRADICCIÓN ! => El constructor no recibe parámetros pero se recibe un array de cerdos por el constructor ???

	//constructor (no recibe parámetros)	
	constructor() {												//constructor(){
		// PROPIEDADES:

		this.cerdos = null;										// cerdos (el array de cerdos que recibimos por el contructor)
		this.interval = {};										// interval: guardamos referencia al setInterval para poder modificarlo
		this.contadorCerdosLanzar = 0;							// contadorCerdosLanzar: contador de cerdos para lanzar (inicio en 0)
		this.tiempo = 30 * 1000;  // 30 segundos				// tiempo: contador de cuenta atras (30000 milisegundos)
		this.cerdosSalvados = 0;								// cerdos_salvados
		this.cerdosMuertos = 0;									// cerdos_muertos
	}

	crearInstancias(numCerdos) {								// método crearInstancias(numCerdos)
		this.cerdos = new Array(numCerdos);

		for (let i = 0; i < numCerdos; ++i) {					// for para tantos cerdos como numCerdos
			this.cerdos[i] = new Cerdo(i);						// Creamos instancia de clase Cerdo con id igual a index y la guardamos en el arrayCerdos
			this.cerdos[i].establecerObjetoPartida(this);
			this.cerdos[i].jugar();								// Llamamos al método jugar de la instancia			
		}
	}

	incrementarCerdosSalvados() {
		++this.cerdosSalvados;
		return this.cerdosSalvados;
	}

	incrementarCerdosMuertos() {
		++this.cerdosMuertos;
		return this.cerdosMuertos;
    }

	lanzarCerdo() {												// método lanzarCerdo() :Cada vez que se llama a este método se lanza un cerdo				
		//cambiamos el estado a 'volando' al cerdo del arrayCerdos al que apunta this.contador

		this.cerdos[this.contadorCerdosLanzar].estado = 'volando';

		//incrementamos el contador de cerdos a lanzar
		++this.contadorCerdosLanzar;								
	}

	play() {													// método play()
		this.crearInstancias(30);								// Llamamos al metodo this.crearInstancias y la pasamos por ejemplo 30 cerdos

		//cambiamos la propiedad display del div .fin (con el texto de entrada) a 'none' para que desaparezca
		document.getElementsByClassName('fin')[0].style.display = 'none';

		//cambiamos la propiedad display del div .juego (con el juego) a 'block' para que aparezca
		document.getElementsByClassName('juego')[0].style.display = 'block';		

		//ponemos a 0 la variable tiempoCerdo que servirá para lanzar cerdos cada 500 milisegundos
		let tiempoCerdo = 0;

		//guardo en this.interval un setInterval que se llama cada 50 milisegundos para crear el movimiento de los cerdos
		let tiempoTranscurrido = 50;

		this.interval = setInterval(function (partida) {
			let final = true;

			for (let i = 0; i < partida.cerdos.length; ++i) {
				partida.cerdos[i].moverCerdo();

				// Terminación temprana. Si ya se han acabado los cerdos... no tiene sentido seguir jugando.
				if (partida.cerdos[i].estado != 'muerto' && partida.cerdos[i].estado != 'salvado')
					final = false;
			}

			if (final)											// Terminación temprana ?
				partida.tiempo = tiempoTranscurrido;
						
			partida.tiempo -= tiempoTranscurrido;				//restamos 50 milisegundos a this.tiempo para la cuenta atras
						
			tiempoCerdo += 1;									// incrementamos en 1 la variable tiempoCerdo

			// si tiempoCerdo llega a 10 y el this.contadorCerdosLanzar es menor que la cantidad de cerdos que quedan en el this.arrayCerdos
			if (tiempoCerdo >= 10 && partida.contadorCerdosLanzar < partida.cerdos.length) {
				partida.lanzarCerdo();							// llamamos al método lanzarCerdo()
				tiempoCerdo = 0;								// y ponemos el el temporizador de lanzamiento de cerdos a 0/inde
			}

			//actualizmos los divs con los datos de this.tiempo, this.cerdos_muertos y this.cerdos_salvados
			document.getElementById('div_contador').innerText = (partida.tiempo / 1000).toFixed(2) + " s";
			document.getElementById('div_cerdos_muertos').innerText = partida.cerdosMuertos.toString();
			document.getElementById('div_cerdos_salvados').innerText = partida.cerdosSalvados.toString();

			if (partida.tiempo <= 0) {							// si el contador this.tiempo ha llegado a 0 llamamos al método end()
				partida.end();
			}

			// recorremos this.arrayCerdos y llamamos a su metodo mover() para que los cerdos vayan cayendo		
		}, tiempoTranscurrido, this);							// FIN SETINTERVAL 50 ms equivale a 20 frames/segundo 
				
		let musica = new Audio('sonidos/musica.mp3');			// música de fondo
		musica.play();
	}

	end() {														// método end()
		clearInterval(this.interval);							// limpia el setInterval para parar la animación

		//Mostramos el div .fin actualizando su propiedad display al valor 'flex'
		document.getElementsByClassName('fin')[0].style.display = 'flex';
		
		//Actualizamos el contenido del div .fin con innerHTML insertando el texto que indica los cerdos salvados, muertos, etc

		let tituloFin = 'Se acabó el juego';
		let mensajeFin = 'Has conseguido salvar a ' + this.cerdosSalvados.toString() + ' cerdos... pero ' + this.cerdosMuertos.toString() + ' han pasado a mejor vida';

		document.getElementsByClassName('fin')[0].children[0].innerHTML = `<h1>${tituloFin}</h1><p>${mensajeFin}</p>`;
		
		document.getElementsByTagName('button')[0].innerText = 'REINICIAR';
		document.getElementsByTagName('button')[0].onclick = function () {
			window.location.reload();
        }
	}
}

objetoJuego = new Juego();										// Craemos una instancia con nombre 'juego' 

//detectamos click sobre el botón y llamamos a juego.play()
document.getElementsByTagName('button')[0].onclick = function () {
	objetoJuego.play();
};

document.body.style.overflow = 'hidden';						// eliminar el posible overflow