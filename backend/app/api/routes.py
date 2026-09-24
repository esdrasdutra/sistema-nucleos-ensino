from fastapi import Depends, status

from app.core.security import get_current_user_polo_id, get_current_user_role, require_roles
from app.api import system
from app.api import polos
from app.api import turmas
from app.api import alunos
from app.api import materias
from app.api import academico
from app.api import analytics
from app.api import portal
from app.schemas import (
    AlunoOut,
    BoletimAlunoOut,
    CursoOut,
    DashboardOverviewOut,
    HistoricoAlunoOut,
    LancarNotaRequest,
    MateriaCreate,
    MateriaOut,
    NotaOut,
    PoloCreate,
    PoloOut,
    RegistrarChamadaRequest,
    TurmaCreate,
    TurmaOut,
    UsuarioOut,
)


def register_routes(app, handlers=None):
    """Registra os endpoints mantendo handlers separados da composição da API."""
    app.add_api_route("/", system.read_root, methods=["GET"])
    app.add_api_route("/api/v1/seed", system.trigger_seed, methods=["POST"], status_code=status.HTTP_200_OK)
    app.add_api_route("/api/v1/usuarios", system.listar_usuarios, methods=["GET"], response_model=list[UsuarioOut])

    app.add_api_route("/api/v1/polos", polos.listar_polos, methods=["GET"], response_model=list[PoloOut])
    app.add_api_route("/api/v1/polos", polos.criar_polo, methods=["POST"], response_model=PoloOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["ADMIN"]))])
    app.add_api_route("/api/v1/polos/{polo_id}", polos.atualizar_polo, methods=["PUT"], response_model=PoloOut, dependencies=[Depends(require_roles(["ADMIN"]))])
    app.add_api_route("/api/v1/polos/{polo_id}", polos.deletar_polo, methods=["DELETE"], status_code=status.HTTP_200_OK, dependencies=[Depends(require_roles(["ADMIN"]))])

    app.add_api_route("/api/v1/turmas", turmas.listar_turmas, methods=["GET"], response_model=list[TurmaOut])
    app.add_api_route("/api/v1/turmas", turmas.criar_turma, methods=["POST"], response_model=TurmaOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["ADMIN", "GESTOR_NUCLEO"]))])
    app.add_api_route("/api/v1/turmas/{turma_id}", turmas.atualizar_turma, methods=["PUT"], response_model=TurmaOut, dependencies=[Depends(require_roles(["ADMIN", "GESTOR_NUCLEO"]))])
    app.add_api_route("/api/v1/turmas/{turma_id}", turmas.deletar_turma, methods=["DELETE"], status_code=status.HTTP_200_OK, dependencies=[Depends(require_roles(["ADMIN", "GESTOR_NUCLEO"]))])

    app.add_api_route("/api/v1/alunos", alunos.listar_alunos, methods=["GET"], response_model=list[AlunoOut])
    app.add_api_route("/api/v1/alunos", alunos.criar_aluno, methods=["POST"], response_model=AlunoOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["ADMIN", "GESTOR_NUCLEO"]))])
    app.add_api_route("/api/v1/alunos/{aluno_id}", alunos.atualizar_aluno, methods=["PUT"], response_model=AlunoOut, dependencies=[Depends(require_roles(["ADMIN", "GESTOR_NUCLEO"]))])
    app.add_api_route("/api/v1/alunos/{aluno_id}", alunos.deletar_aluno, methods=["DELETE"], status_code=status.HTTP_200_OK, dependencies=[Depends(require_roles(["ADMIN", "GESTOR_NUCLEO"]))])

    app.add_api_route("/api/v1/materias", materias.listar_materias, methods=["GET"], response_model=list[MateriaOut], dependencies=[Depends(require_roles(["ADMIN"]))])
    app.add_api_route("/api/v1/materias", materias.criar_materia, methods=["POST"], response_model=MateriaOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["ADMIN"]))])
    app.add_api_route("/api/v1/materias/{materia_id}", materias.atualizar_materia, methods=["PUT"], response_model=MateriaOut, dependencies=[Depends(require_roles(["ADMIN"]))])
    app.add_api_route("/api/v1/materias/{materia_id}", materias.deletar_materia, methods=["DELETE"], status_code=status.HTTP_200_OK, dependencies=[Depends(require_roles(["ADMIN"]))])
    app.add_api_route("/api/v1/cursos", materias.listar_cursos, methods=["GET"], response_model=list[CursoOut])

    app.add_api_route("/api/v1/frequencia/sessao", academico.obter_sessao_chamada, methods=["GET"])
    app.add_api_route("/api/v1/frequencia/registrar", academico.registrar_chamada, methods=["POST"], dependencies=[Depends(require_roles(["ADMIN", "GESTOR_NUCLEO"]))])
    app.add_api_route("/api/v1/avaliacoes", academico.obter_notas_turma, methods=["GET"], response_model=list[NotaOut])
    app.add_api_route("/api/v1/avaliacoes/registrar", academico.registrar_notas, methods=["POST"], dependencies=[Depends(require_roles(["ADMIN", "GESTOR_NUCLEO"]))])

    app.add_api_route("/api/v1/portal-aluno/{aluno_id}", portal.obter_boletim_aluno, methods=["GET"], response_model=BoletimAlunoOut)
    app.add_api_route("/api/v1/historico-aluno/{aluno_id}", portal.obter_historico_aluno, methods=["GET"], response_model=HistoricoAlunoOut)
    app.add_api_route("/api/v1/analytics/overview", analytics.obter_dashboard_analytics, methods=["GET"], response_model=DashboardOverviewOut, dependencies=[Depends(require_roles(["ADMIN"]))])
