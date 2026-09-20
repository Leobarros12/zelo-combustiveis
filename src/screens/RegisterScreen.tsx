import React, { useState } from 'react';

interface RegisterScreenProps {
  onNavigate: (screen: any) => void;
  onLogin: (user: { name: string; email: string }) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate, onLogin }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    termos: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    }
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    }
    if (!formData.termos) {
      newErrors.termos = 'Você precisa aceitar os termos';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onLogin({ name: formData.nome, email: formData.email });
    onNavigate('list');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-wid-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar sua conta no Zelo
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
              {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.termos}
                onChange={(e) => setFormData({ ...formData, termos: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Aceito os termos e condições
              </label>
            </div>
            {errors.termos && <p className="text-red-500 text-xs mt-1">{errors.termos}</p>}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Cadastrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};