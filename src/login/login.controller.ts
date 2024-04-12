import {
  Body,
  Controller,
  Param,
  Post,
  Render,
  Get,
  HttpCode,
  Res,
} from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('index.php/login/v2')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  @HttpCode(200)
  async generateFlow(): Promise<any> {
    return this.loginService.generateFlow();
  }

  // The target for the login form
  @Post('/grant')
  @HttpCode(200)
  @Render('login')
  async grant(
    @Res() res: any,
    @Body() formData: { username: string; password: string; flow_id: string },
  ): Promise<any> {
    if (
      await this.loginService.grantFlow(
        formData.username,
        formData.password,
        formData.flow_id,
      )
    ) {
      // Successful authentication
      return {
        flow_id: formData.flow_id,
        message: 'Successfully authenticated device',
      };
    } else {
      // Wrong credentials
      res.status(401);
      return {
        flow_id: formData.flow_id,
        message: 'Wrong credentials',
      };
    }
  }

  @Get('/flow/:flowId')
  @Render('login')
  async loginPage(@Param() params: any): Promise<any> {
    // Return html login page, this needs to be templated so that the flowId is included in the form as a hidden field
    return { flow_id: params.flowId };
  }

  @Post('/poll/:flowId')
  @HttpCode(200)
  async poll(
    @Param() params: any,
    @Body() body: { token: string },
  ): Promise<any> {
    return this.loginService.pollFlow(params.flowId, body.token);
  }
}
