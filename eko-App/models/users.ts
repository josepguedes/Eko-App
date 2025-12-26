import AsyncStorage from '@react-native-async-storage/async-storage';

export class User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    cars: string[];
    goals: string[];
    isLoggedIn: boolean = false;

    constructor(id: string, email: string, name: string, createdAt: Date = new Date(), cars: string[] = [] , goals: string[] = [], isLoggedIn: boolean = false) {
        if (!id || !email || !name) {
            throw new Error('ID, email e nome são obrigatórios');
        }
        this.id = id;
        this.email = email;
        this.name = name;
        this.createdAt = createdAt;
        this.cars = cars;
        this.goals = goals;
        this.isLoggedIn = isLoggedIn;
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            createdAt: this.createdAt.toISOString(),
            cars: this.cars,
            goals: this.goals,
            isLoggedIn: this.isLoggedIn
        };
    }

    static fromJSON(json: any): User {
        if (!json) {
            throw new Error('JSON inválido');
        }
        return new User(
            json.id,
            json.email,
            json.name,
            new Date(json.createdAt),
            json.cars || [],
            json.goals || [],
            json.isLoggedIn || false
        );
    }
}

const STORAGE_KEY = 'users';

export async function saveUser(user: User): Promise<void> {
    if (!user) {
        throw new Error('Utilizador inválido');
    }
    try {
        const users = await getAllUsers();
        const index = users.findIndex(u => u.id === user.id);
        
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users.map(u => u.toJSON())));
    } catch (error) {
        throw new Error(`Erro ao guardar utilizador: ${error}`);
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data).map((json: any) => User.fromJSON(json));
    } catch (error) {
        throw new Error(`Erro ao obter utilizadores: ${error}`);
    }
}

export async function getUserById(id: string): Promise<User | undefined> {
    if (!id) {
        throw new Error('ID é obrigatório');
    }
    const users = await getAllUsers();
    return users.find(u => u.id === id);
}

export async function deleteUser(id: string): Promise<void> {
    if (!id) {
        throw new Error('ID é obrigatório');
    }
    try {
        const users = await getAllUsers();
        const filteredUsers = users.filter(u => u.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers.map(u => u.toJSON())));
    } catch (error) {
        throw new Error(`Erro ao eliminar utilizador: ${error}`);
    }
}async function updateUser(id: string, updates: Partial<Pick<User, 'email' | 'name'>>): Promise<void> {
    if (!id) {
        throw new Error('ID é obrigatório');
    }
    const user = await getUserById(id);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    
    if (updates.email) user.email = updates.email;
    if (updates.name) user.name = updates.name;
    
    await saveUser(user);
}

export async function loginUser(id: string): Promise<void> {
    if (!id) {
        throw new Error('ID é obrigatório');
    }
    const user = await getUserById(id);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    user.isLoggedIn = true;
    await saveUser(user);
}

export async function logoutUser(id: string): Promise<void> {
    if (!id) {
        throw new Error('ID é obrigatório');
    }
    const user = await getUserById(id);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    user.isLoggedIn = false;
    await saveUser(user);
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
    // Validação de campos vazios
    if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error('Por favor, preencha todos os campos');
    }

    // Validação de nome (mínimo 3 caracteres)
    if (name.trim().length < 3) {
        throw new Error('O nome deve ter pelo menos 3 caracteres');
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Por favor, insira um email válido');
    }

    // Validação de password (mínimo 6 caracteres)
    if (password.length < 6) {
        throw new Error('A password deve ter pelo menos 6 caracteres');
    }

    // Verificar se o email já existe
    const users = await getAllUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error('Este email já está registado');
    }

    // Gerar ID sequencial começando em 1
    let newId = 1;
    if (users.length > 0) {
        const maxId = Math.max(...users.map(u => parseInt(u.id) || 0));
        newId = maxId + 1;
    }

    // Criar novo utilizador
    const newUser = new User(
        newId.toString(),
        email,
        name,
        new Date(),
        [],
        [],
        false
    );

    // Guardar utilizador
    await saveUser(newUser);

    return newUser;
}

// Verificar se estou logado e se sim retornar o utilizador
export async function getLoggedInUser(): Promise<User | null> {
    const users = await getAllUsers();
    const loggedInUser = users.find(u => u.isLoggedIn);
    return loggedInUser || null;
}

// Verificar se utilizador etá logado para dar acesso à app
export async function isUserLoggedIn(): Promise<boolean> {
    const users = await getAllUsers();
    return users.some(u => u.isLoggedIn);
}