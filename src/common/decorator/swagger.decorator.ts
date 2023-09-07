import { Type, applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PageResDto } from '../dto/res.dto';

// ApiGetResponse = Status Code가 200일때
export const ApiGetResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    // schema로 투입 Decorator인자로 받은 걸 Model에 투입
    // ApiOkResponse
    ApiOkResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(model) }],
      },
    }),
  );
};

export const ApiPostResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    // schema로 투입 Decorator인자로 받은 걸 Model에 투입
    // Created는 Post일 때 = 201일때
    ApiCreatedResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(model) }],
      },
    }),
  );
};

export const ApiGetItemsResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          // 페이지 Dto부터 먼저 Schema를 가져온다.
          { $ref: getSchemaPath(PageResDto) },
          {
            // Properties 지정
            properties: {
              // items에 대한 model 지정해주고, Schema를 가져온다.
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
            required: ['items'],
          },
        ],
      },
    }),
  );
};
