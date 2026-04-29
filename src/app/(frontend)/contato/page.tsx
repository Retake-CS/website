export default function Contato() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-rcs-sec mb-6">Contato</h1>
      <div className="max-w-2xl">
        <p className="text-lg mb-6">
          Entre em contato conosco! Estamos sempre abertos a sugestões, parcerias e feedback da comunidade.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-rcs-sec mb-2">Email</h3>
            <p className="text-rcs-bg">contato@rcs.com.br</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-rcs-sec mb-2">Redes Sociais</h3>
            <p className="text-rcs-bg">Siga-nos nas redes sociais para ficar por dentro das últimas novidades!</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-rcs-sec mb-2">Sugestões</h3>
            <p className="text-rcs-bg">
              Tem uma ideia para melhorar o site? Quer sugerir uma cobertura especial?
              Entre em contato conosco!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
