import AsyncStorage from '@react-native-async-storage/async-storage';

export class User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    cars: string[];
    goals: string[];
    groups: string[];
    isLoggedIn: boolean = false;

    constructor(id: string, email: string, name: string, createdAt: Date = new Date(), cars: string[] = [] , goals: string[] = [], groups: string[] = [], isLoggedIn: boolean = false) {
        if (!id || !email || !name) {
            throw new Error('ID, email e nome são obrigatórios');
        }
        this.id = id;
        this.email = email;
        this.name = name;
        this.createdAt = createdAt;
        this.cars = cars;
        this.goals = goals;
        this.groups = groups;
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
            groups: this.groups,
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
            json.groups || [],
            json.isLoggedIn || false
        );
    }
}

const STORAGE_KEY = 'users';

// Inicializar utilizadores pré-definidos
export async function initializeDefaultUsers(): Promise<void> {
    const users = await getAllUsers();
    
    // Verificar se já existem os utilizadores pré-definidos
    const hasDefaultUsers = users.some(u => u.id.startsWith('default_'));
    if (hasDefaultUsers) {
        return;
    }

    const defaultUsers = [
        new User(
            'default_1',
            'maria.silva@email.pt',
            'Maria Silva',
            new Date('2024-01-15'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_2',
            'joao.santos@email.pt',
            'João Santos',
            new Date('2024-02-10'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_3',
            'ana.costa@email.pt',
            'Ana Costa',
            new Date('2024-03-05'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_4',
            'pedro.rodrigues@email.pt',
            'Pedro Rodrigues',
            new Date('2024-03-20'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_5',
            'catarina.fernandes@email.pt',
            'Catarina Fernandes',
            new Date('2024-04-01'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_6',
            'ricardo.almeida@email.pt',
            'Ricardo Almeida',
            new Date('2024-04-15'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_7',
            'sofia.pereira@email.pt',
            'Sofia Pereira',
            new Date('2024-05-01'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_8',
            'tiago.oliveira@email.pt',
            'Tiago Oliveira',
            new Date('2024-05-10'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_9',
            'beatriz.sousa@email.pt',
            'Beatriz Sousa',
            new Date('2024-06-05'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_10',
            'miguel.carvalho@email.pt',
            'Miguel Carvalho',
            new Date('2024-06-20'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_11',
            'ines.martins@email.pt',
            'Inês Martins',
            new Date('2024-07-01'),
            [],
            [],
            [],
            false
        ),
        new User(
            'default_12',
            'francisco.lopes@email.pt',
            'Francisco Lopes',
            new Date('2024-07-15'),
            [],
            [],
            [],
            false
        ),
    ];

    // Guardar todos os utilizadores
    for (const user of defaultUsers) {
        await saveUser(user);
    }
    console.log('12 utilizadores pré-definidos criados com sucesso!');
}

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
}

async function updateUser(id: string, updates: Partial<Pick<User, 'email' | 'name'>>): Promise<void> {
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
    if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error('Por favor, preencha todos os campos');
    }

    if (name.trim().length < 3) {
        throw new Error('O nome deve ter pelo menos 3 caracteres');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Por favor, insira um email válido');
    }

    if (password.length < 6) {
        throw new Error('A password deve ter pelo menos 6 caracteres');
    }

    const users = await getAllUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error('Este email já está registado');
    }

    let newId = 1;
    if (users.length > 0) {
        const maxId = Math.max(...users.map(u => {
            const id = parseInt(u.id.replace('default_', ''));
            return isNaN(id) ? 0 : id;
        }));
        newId = maxId + 1;
    }

    const newUser = new User(
        newId.toString(),
        email,
        name,
        new Date(),
        [],
        [],
        [],
        false
    );

    await saveUser(newUser);
    return newUser;
}

export async function getLoggedInUser(): Promise<User | null> {
    const users = await getAllUsers();
    const loggedInUser = users.find(u => u.isLoggedIn);
    return loggedInUser || null;
}

export async function isUserLoggedIn(): Promise<boolean> {
    const users = await getAllUsers();
    return users.some(u => u.isLoggedIn);
}

export async function addGroupToUser(userId: string, groupId: string): Promise<void> {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    if (!user.groups.includes(groupId)) {
        user.groups.push(groupId);
        await saveUser(user);
    }
}

export async function removeGroupFromUser(userId: string, groupId: string): Promise<void> {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    user.groups = user.groups.filter(id => id !== groupId);
    await saveUser(user);
}