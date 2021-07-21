# Instalar el CLI de Amplify

```ps
npm install -g @aws-amplify/cli
```

# Crear la App React

Crear el template de la aplicación _react_, usando typescript:

```ps
npx create-react-app mi-app --template typescript
```

# Configurar Amplify para nuestra App

Configuramos amplify:

```ps
cd mi-app

amplify configure
```

Especificamos los siguientes valores:

|Cuenta|Valor|
|-----|-----|
|euge|egsmartin@hotmail.com|
|Client ID|AKIAXBEVMWBDJKJG6AM4|
|Client Secret|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|

Instalamos las dependencias de Amplifly:

```ps
npm install aws-amplify @aws-amplify/ui-react
```

Lo inicializamos:

```ps
amplify init
```

# Crear Backend GraphQL 

Instalamos el modulo uuid para crear uuid:

```ps
npm install antd uuid
```

Para crear una api GraphQL usamos:

```ps
amplify add api


C:\Users\Eugenio\Downloads\app-gql>amplify add api
? Please select from one of the below mentioned services: GraphQL
? Provide API name: notesapi
? Choose the default authorization type for the API API key
? Enter a description for the API key: Mi clave de acceso
? After how many days from now the API key should expire (1-365): 365
? Do you want to configure advanced settings for the GraphQL API No, I am done.
? Do you have an annotated GraphQL schema? No
? Choose a schema template: One-to-many relationship (e.g., “Blogs” with “Posts” and “Comments”)
```

Elegimos GraphQL como tipo de API. En _amplify\backend\api\notesapi_ se genera el código. En _schema.graphql_ tenemos la definición del esquema:

```js
type Note @model {
  id: ID!
  clientId: ID
  name: String!
  description: String
  completed: Boolean
}
```
The GraphQL Transform library allows you to annotate a GraphQL schema with different directives like @model, @connection, @auth, and others. The @model directive we used in this schema will transform the base Note type into an expanded AWS AppSync GraphQL API complete with:

- Additional schema definitions for queries and mutations (Create, Read, Update, Delete, and List operations)
- Additional schema definitions for GraphQL subscriptions
- DynamoDB database
- Resolver code for all GraphQL operations mapped to DynamoDB database

Desplegamos la api:

```ps
amplify push

√ Generated GraphQL operations successfully and saved at src\graphql
√ Code generated successfully and saved in file src\API.ts
√ All resources are updated in the cloud

GraphQL endpoint: https://tl2do3hdpjgpjb4u2aakug5zse.appsync-api.eu-west-1.amazonaws.com/graphql
GraphQL API KEY: da2-btotoud4ufbl5japgddkfm5udm
```

Podemos probar la api - REST o GraphQL - usando la consola de amplify:

```ps
amplify console api
```

# Codigo

Estamos usando typscript, así que además de una prueba de concepto de _Amplify_ estamos analizando la versatilidad de _typescript_.

## Usar Amplify

Añadimos en index.ts que vamos a utilizar _Amplify_:

```js
import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)
```

## Estilos

Para definir los estilos, el tipo que usaremos es _CSS.Properties_:

```js
import CSS from 'csstype';

//En styles definimos varios elementos, todos ellos contendran uno o varios estilos, por eso los definimos como CSS.Properties
const styles = {
  container: { padding: '20', margin: '0' } as CSS.Properties,
  input: { marginBottom: '10' } as CSS.Properties,
  item: { textAlign: 'left' } as CSS.Properties,
  p: { color: '#1890ff' } as CSS.Properties
}
```

Ahora podremos usarla en el _jsx_ de forma habitual:

```js
  return (
    <div style={styles.container}>
```

## Tipos

Vamos a definir los tipos que usaremos para las notas, las acciones y el estado. Destacar por ejemplo como estamos definiendo algunas propiedades opcionales en estos tipos. Lo hacemos con _?_:

```js
//Tipos
type nota = {
  id?: string 
  clientId: string
  name: string
  description?: string
  completed?: boolean
}

type estado={
  notes: nota[],
  loading: boolean,
  error: boolean,
  form: { name: string, description: string }
}
```

Para las acciones nos conviene utilizar un tipo compuesto. Observar también como en el tipo de la accion estamos indicando, como parte del tipo, el dominio de valores posible:

```js
type accion=
  {
    type: 'ERROR' | 'RESET_FORM'
  } |
  {
    type: 'SET_INPUT'
    name: string,
    value:string
  } |
  {
    type: 'ADD_NOTE'
    note: nota,
  } |
  {
    type: 'SET_NOTES'
    notes: nota[],
  } 
```

Con esto ya podemos definir el estado inicial:

```js
  
const initialState: estado = {
  notes: [],
  loading: true,
  error: false,
  form: { name: '', description: '' }
}
```

Vamos a utilizar __generics__, en este caso para definir una función, el reductor del estado _de tipo React.Reducer<estado, accion>_:

```js

//Definimos el reducer como una función del tipo React.Reducer<estado, accion> 
let reducer: React.Reducer<estado, accion> =
  (state, action) => {
    switch (action.type) {
      case 'SET_NOTES':
        return { ...state, notes: action.notes, loading: false }
      case 'ADD_NOTE':
        return { ...state, notes: [action.note, ...state.notes] }
      case 'RESET_FORM':
        return { ...state, form: initialState.form }
      case 'SET_INPUT':
        return { ...state, form: { ...state.form, [action.name]: action.value } }
      case 'ERROR':
        return { ...state, loading: false, error: true }
      default:
        return state
    }
  }
```

## Hooks

### Estado

En este caso como el estado tiene una estructura más compleja, y que remos definir distintas acciones, atacando cada una de ellas a una parte específica del estado, nos conviene usar _useReducer_:

```js
//Usamos useReducer como hook
const [state, dispatch] = useReducer(reducer, initialState)
```

### useEffect

Para actualizar el _DOM_ con los datos del backend, usaremos useEffect:

```js
  useEffect(() => {
    fetchNotes()
    const subscription = API.graphql(graphqlOperation(onCreateNote))
    // @ts-ignore:
      .subscribe({
        next: update_notes
      })
    return () => subscription.unsubscribe()
  }, [])
```

En este caso estamos recuperando las Notas con _fetchNotes()_ - la función actualiza el estado, como veremos a continuación, y esto redunda en que se repinte la aplicación -, y por otro lado nos subscribimos con GraphQL para que se nos avise de la creación de notas:

```js
const subscription = API.graphql(graphqlOperation(onCreateNote))
```

__NOTA:__ Observese como usamos _// @ts-ignore:_ para indicarle a _tsc_ que se ignore el error en la linea más abajo. Con la subscripción indicamos que método debe ejecutarse cuando una nota sea creada:

```js
{
  next: update_notes
}
```

Lo que haremos es actualizar el estado siempre y cuando la nota no la hayamos creado nosotros:

```js
  //Que hacer cuando se haya creado una nota
  function update_notes(x:any){
    const note = x.value.data.onCreateNote
    if (CLIENT_ID === note.clientId) return
    //Actualizar el estado cuando la nueva nota, no la hayamos creado nosotros
    dispatch({ type: 'ADD_NOTE', note })
  }
```

Antes de pasar a comentar el método que usar una query de GraphQL, comentar que en el useEffect nos estamos asegurando de que cuando la App se "muera", se elimine la subscripción a GraphQL:

```js
 //Una vez se ha creado el virtual DOM
  useEffect(() => {
    fetchNotes()
 
 ...
 
    return () => subscription.unsubscribe()
  }, [])
```

El método que recupera las notas, actualiza el estado:

```js
  async function fetchNotes() {
    try {
      //Recupera los datos
      //let notesData: { data: { listnotes: items[] } }
      const notesData = await API.graphql(graphqlOperation(listNotes))
      // @ts-ignore:
      dispatch({ type: 'SET_NOTES', notes: notesData.data.listNotes.items })

    } catch (err) {
      console.log('error: ', err)
      dispatch({ type: 'ERROR' })
    }
  }
```

## Handlers

Definimos a continuación los handlers que van a procesar los eventos de nuestra App:

```js
  function onChange(e:React.ChangeEvent<HTMLInputElement>) {

  async function createNote() {

  async function updateNote(note:nota) {

  async function deleteNote( id:string|undefined) {
```

Todos ellos se caracterizan por:

- Actualizar el estado

```js
  async function deleteNote( id:string|undefined) {
    const index = state.notes.findIndex(n => n.id === id)
    const notes = [...state.notes.slice(0, index), ...state.notes.slice(index + 1)];
    dispatch({ type: 'SET_NOTES', notes })
```

- Llamar a una mutación de GraphQL:

```js
    try {
      await API.graphql(graphqlOperation(DeleteNote, { input: { id } }))
      console.log('se borro la nota!')
    } catch (err) {
      console.log({ err })
    }
```

## Rutas

Vamos a utilizar rutas para demostrar como proteger ciertos componentes - rutas:

```ps
npm install react-router-dom @types/react-router-dom
```

En `Router.tsx` definimos un router de tipo _HashRouter_:

```js
<HashRouter>
    <Nav current={current} />
    <Switch>
        <Route exact path="/" component={Public} />
        <Route exact path="/protected" component={Protected} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/monedas" component={Monedas} />
        <Route component={Public} />
    </Switch>
</HashRouter>
```

El componente incluye el componente _Nav_ al que se le pasa una propiedad _current_, y un _Switch_ en el que se gestionan cinco rutas.

La propiedad _current_ es el estado y guarda el nombre de la ruta activa:

```js
const [current, setCurrent] = useState('home')
```

```js
function setRoute() {
    const location = window.location.href.split('/')
    const pathname = location[location.length - 1]
    setCurrent(pathname ? pathname : 'home')
}
```

Este método se invoca cada vez que se cambia la ruta. Para ello la primera vez que se renderiza la app - _useEffect(() => {},[])_ -, nos subscribimos al evento _hashchange_. Cando el componente se termina, eliminamos la subscripción:

```js
useEffect(() => {
    setRoute()
    window.addEventListener('hashchange', setRoute)
    return () => window.removeEventListener('hashchange', setRoute)
}, [])
```

### Nav

En el componente Nav incluimos un menú desde el que podemos acceder a todas las rutas. Como estamos usando typescript, el componente esta tipado. Se tipa con el generic _FunctionComponent<T>_ donde _T_ es el tipo de las props que se pasan al componente, que también estan tipadas:

```js
type propiedades={
    current: string
}

const Nav: FunctionComponent<propiedades> = (props: propiedades) => {
```

El menú tiene se pinta en horizontal -_mode="horizontal"_- y tiene una serie de items identificados con su _key_ -_<Menu.Item key='home'>_-. Cada item es un link a un componente  -_<Link to={`/`}>_-. Por último, podemos especificar un icono con cada item del menú - por ejemplo, _<HomeOutlined />_:

```js
<Menu selectedKeys={[current]} mode="horizontal">
    <Menu.Item key='home'>
        <Link to={`/`}>
            <HomeOutlined />Home
        </Link>
    </Menu.Item>
```

## Autenticación

Añadimos el backend de autenticación

```ps
amplify add auth
```

```ps
amplify push
```

Tenemos dos herramientas a nuestra disposición:
- Clase _Auth_
- Componentes React - también hay React-Native, Angular y VUE

En el componente _Protected.tsx_ demostramos como usar la clase _Auth_. Una vez el virtual DOM se ha creado:

```js
useEffect(() => {
    Auth.currentAuthenticatedUser()
        .catch(() => {
            props.history.push('/profile')
        })
    }, [])
```

Estamos accediendo al usuario que está autenticado. Sino hubiera ningun usuario autenticado, se lanza una excepción, que procesamos para forzar la navegación a la ruta _/profile_. Notese también que al definir el componente lo hemos tipificado indicando que tiene una propiedad _RouteComponentProps<T>_, donde _T_ es la definición del objeto que pasamos como parametro - en nuestro caso no pasamos ningún parametro:

```js
type TParams = {  };
const Protected: FunctionComponent<RouteComponentProps<TParams>> = function (props: RouteComponentProps<TParams>) {
```

En _Profile.tsx_ demostramos el uso de los componentes visuales, en este caso, de _<AmplifySignOut />_:

```js
<Container>
    <h1>Profile</h1>
    <h2>Username: {user.username}</h2>
    <h3>Email: {user.email}</h3>
    <h4>Phone: {user.phone_number}</h4>
    <AmplifySignOut />
</Container>
```