/*Ancho y alto del div de fondo de la aplicación */
// VARIABLES GLOBALES
var ancho_fondo = window.innerWidth;
var alto_fondo = window.innerHeight

/*clase Cerdo*/
class Cerdo {
	constructor(id)  {
		/*funcion random() devuelve valor aleatorio entre -5 y 5*/ 
		function random()
		{			
			var min = parseInt(-5, 10);
			return Math.round(Math.random() * (5 - min) + min);			
		}
		// variable random_posicion_x : Guarda la posicion aleatoria en el eje x dentro de mi ventana
		var random_posicion_x = random();

		// PROPIEDADES		
		this.id = id;
		this.vida = 1;
		this.top = 0;
		this.left = random_posicion_x;
		this.velx = 0;
		this.vely = random();
		this.estado = 'esperando'; //puede valer salvado, muerto, esperando o volando
		this.clon = ''; //Guarda el html correspondiente al cerdo		
	}
	
	// método Jugar()
	jugar() {
		
		//Guardamos en this.clon un clon del div #plantilla	
		this.clon = document.getElementById('plantilla').cloneNode(true);
				
		//añadimos a this.clon el atributo id correspondiente a la propiedad this.id del objeto				
		this.clon.id = this.id;
		
		// cambiamos la propiedad css left para que coincida con this.left
		this.clon.style.left = this.left;

		//Añado el html de this.clon al div .fondo		
		for (var i = 0; i < document.getElementsByClassName('fondo').length; i++)
			document.getElementsByClassName('fondo')[i].innerHTML += document.getElementById('plantilla').innerHTML; // this.clon;

		/*for (var i = 0; i < document.getElementsByClassName('fondo').length; i++) {
			document.getElementsByClassName('fondo')[i].innerHTML = this.clon;
		}		*/
		
		//Añadimos listener de click a this.clon 
		this.clon.addEventListener("click", function myFunction() {	 				
			//Si click en cerdo...
			//cambiamos this.estado a salvado	
			this.estado = 'salvado';

			//Añadimos la clase feliz al cerdo
			this.clon.classList.add('feliz');
			}
		);	
				
		//incrementamos la propiedad cerdos_salvados del objeto partida
		this.cerdos_salvados++;
			
		//Actualizamos el el dom para que aparezcan los cerdos salvados en pantalla
		document.getElementById('div_cerdos_salvados').innerText = this.cerdos_salvados;
		
		//Cargamos sonido y reproducimos	
		var audio = new Audio('sonidos/oink.mp3');
		audio.play();		

		//Ponemos temporizador para que al cabo de un segundo se llame al metodo borrarCerdo
		let temporizadorBorrarCerdo = function (partida) {			
			partida.borrarCerdo();
		};

		setInterval(temporizadorBorrarCerdo(this), 1000);
	}			

	// método matarCerdo()	
	matarCerdo() {	

		//cambiamos propiedad estado del cerdo a 'muerto'
		this.estado = 'muerto';

		//añadimos al clon la clase 'hot'
		this.clon.classList.add('hot');

		//eliminamos la clase 'cerdo'
		this.clon.classList.remove('cerdo');
		
		//incrementamos la propiedad cerdos_muertos del objeto 'juego'
		juego.cerdos_muertos += 1;
		
		//insertamos en pantalla los cerdos muertos
		document.getElementById('div_cerdos_muertos').innerText = this.cerdos_muertos;
		
		//cargamos y reproducimos el sonido del cerdo muerto			
		var audio = new Audio('sonidos/chilla.mp3');
		audio.play();
	}

	// método mover()
	mover(){
		//miramos si el estado del cerdo es 'volando'. En caso afirmativo...
		if(this.estado == 'volando'){
			// comprobamos que el cerdo ha llegado al final de la pantalla. Si es así...
			if (this.clon.left >= ancho_fondo){
				//llamamos al método martarCerdo()
				matarCerdo();
			}
		}
				
		//Si aún está volando 
		if(this.estado == 'volando'){
			//incrementamos la posición top del cerdo
			this.top += 1;
		}
		
		//Actualizamos el propiedad CSS top del clon con el valor this.top
		this.clon.top = this.top;		
	}
	
	// método borrarCerdo()
	borrarCerdo() {
		//Cambiamos el valor de la propiedad display del cerdo por 'none'
		this.clon.style.display = 'none';
	}

	//metodo sonido(fuente)
	//metodo para cargar un archivo 'fuente' y reproducirlo (la fuente debe ser la ruta completa del archivo)
	sonido(fuente){		
		const sonido = document.createElement("audio");
		sonido.src = fuente;
		sonido.setAttribute("preload", "auto");
		
		// Carga un sonido a través de su fuente y lo inyecta de manera oculta
		sonido.setAttribute("controls", "none");

	 	sonido.style.display = "none"; // <-- oculto
		document.body.appendChild(sonido);
		return sonido;	
	}
}

// ******************* clase juego *************************************
class Juego {
	//constructor (no recibe parámetros)	
	constructor(Arraycerdos) {
		//propiedades:		
		//cerdos (el array de cerdos que recibimos por el contructor)
		this.cerdos = Arraycerdos;

		//interval: guardamos referencia al setInterval para poder modificarlo
		this.interval = 0;

		//contadorCerdosLanzar: contador de cerdos para lanzar (inicio en 0)
		this.contadorCerdosLanzar = 0

		//tiempo: contador de cuenta atras (30000 milisegundos)
		this.tiempo = 30000;

		//cerdos_salvados
		this.cerdos_salvados = 0;

		//cerdos_muertos
		this.cerdos_muertos = 0;				
	}
	
	//método crearInstancias(numCerdos)
	crearInstancias (numCerdos) {				
		//for para tantos cerdos como numCerdos		
		for (var index = 0; index<numCerdos; index++){							
			
			//Creamos instancia de clase Cerdo con id igual a index y la guardamos en el arrayCerdos									
			var instcerdo = new Cerdo(index);
			this.cerdos.push(instcerdo);			
						
			//Llamamos al método jugar de la instancia
			instcerdo.jugar();
		}	
	}

	// método lanzarCerdo() :Cada vez que se llama a este método se lanza un cerdo
	lanzarCerdo () {		
		//cambiamos el estado a 'volando' al cerdo del arrayCerdos al que apunta this.contador
		arrayCerdos[this.contadorCerdosLanzar].estado = 'volando';

		//incrementamos el contador de cerdos a lanzar	
		contadorCerdosLanzar += 1;
	}

	// método play()
	play (){	
		// Llamamos al metodo this.crearInstancias y la pasamos por ejemplo 30 cerdos
		this.crearInstancias(30);
		
		//cambiamos la propiedad display del div .fin (con el texto de entrada) a 'none' para que desaparezca
		document.getElementsByClassName('fin')[0].style.display ="none";
		
		//cambiamos la propiedad display del div .juego (con el juego) a 'block' para que aparezca
		document.getElementsByClassName('juego')[0].style.display ="block";

		//ponemos a 0 la variable tiempoCerdo que servirá para lanzar cerdos cada 500 milisegundos
		this.tiempoCerdo = 0;		

		//var tiempoCerdo = 5000
		//guardo en this.interval un setInterval que se llama cada 50 milisegundos para crear el movimiento de los cerdos
		
		this.interval = function(partida) {				
			//restamos 50 milisegundos a this.tiempo para la cuenta atras
			partida.tiempo -= 50;
				
			// incrementamos en 1 la variable tiempoCerdo
			partida.tiempoCerdo++;
					
			// si tiempoCerdo llega a 10 y el this.contadorCerdos Lanzar es menor que la cantidad de cerdos que quedan en el this.arrayCerdos
			if (partida.tiempoCerdo >= 10 && partida.contadorCerdosLanzar < partida.arrayCerdos.length) {
			
				//llamamos al método lanzarCerdo()						
				lanzarCerdo();

				//y ponemos el el temporizador de lanzamiento de cerdos a 0
				partida.contadorCerdosLanzar = 0;
			}
			
			//actualizmos los divs con los datos de this.tiempo, this.cerdos_muertos y this.cerdos_salvados
			document.getElementById('div_contador').innerText = partida.tiempo;
			document.getElementById('div_cerdos_muertos').innerText = partida.cerdos_muertos;
			document.getElementById('div_cerdos_salvados').innerText = partida.cerdos_salvados;			

			//si el contador this.tiempo ha llegado a 0 llamamos al método end()
			if (partida.tiempo <= 0){
				end();
			}

			//recorremos this.arrayCerdos y llamamos a su metodo mover() para que los cerdos vayan cayendo
			for (let i = 0; i < partida.cerdos.length; i++){
				partida.cerdos[i].mover();
			}
		 //FIN SETINTERVAL 50 ms equivale a 20 frames/segundo 		 
		}

		setInterval(this.interval(this), 50);
	}

	// método end()
	end() {	
		// limpia el setInterval para parar la animación		
		clearInterval(AnimationInterval);	

		//Mostramos el div .fin actualizando su propiedad display al valor 'flex'
		document.getElementsByClassName('fin')[0].style.display = "flex";

		//Actualizamos el contenido del div .fin con innerHTML insertando el texto que indica los cerdos salvados, muertos, etc
		
	}
}

// Craemos una instancia con nombre 'juego' 
var arrayCerdos = new Array();
var juego = new Juego(arrayCerdos);

//detectamos click sobre el botón y llamamos a juego.play()
var boton = document.getElementsByClassName('fin')[0].childNodes[3];
boton.addEventListener("click", function myFunction() {	 				
	juego.play();
	}
);